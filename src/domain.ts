import type { DatabaseSync } from 'node:sqlite';
import type { Role, Status } from './db.js';

export type Actor = { id: number; name: string; email: string; role: Role };

export class DomainError extends Error {
  constructor(message: string, public statusCode = 400) { super(message); }
}

const transitions: Record<Status, Status[]> = {
  REPORTED: ['TRIAGED'],
  TRIAGED: ['SCHEDULED'],
  SCHEDULED: ['RESOLVED'],
  RESOLVED: ['TRIAGED'],
};

export function canSeeRequest(db: DatabaseSync, actor: Actor, requestId: number) {
  if (actor.role === 'MANAGER') return Boolean(db.prepare('SELECT 1 FROM maintenance_requests WHERE id=?').get(requestId));
  return Boolean(db.prepare('SELECT 1 FROM request_assignments WHERE request_id=? AND contractor_id=?').get(requestId, actor.id));
}

export function transitionRequest(db: DatabaseSync, actor: Actor, requestId: number, next: Status) {
  if (!canSeeRequest(db, actor, requestId)) throw new DomainError('Request not found or not assigned to you.', 404);
  const request = db.prepare('SELECT status FROM maintenance_requests WHERE id=?').get(requestId) as { status: Status } | undefined;
  if (!request) throw new DomainError('Request not found.', 404);
  if (!transitions[request.status].includes(next)) {
    throw new DomainError(`Cannot move a request from ${request.status} to ${next}. Allowed next status: ${transitions[request.status].join(', ')}.`);
  }
  if (next === 'SCHEDULED') {
    const assigned = db.prepare('SELECT 1 FROM request_assignments WHERE request_id=? LIMIT 1').get(requestId);
    if (!assigned) throw new DomainError('Assign at least one contractor before moving a request to Scheduled.');
  }
  transaction(db, () => {
    db.prepare(`UPDATE maintenance_requests SET status=?, updated_at=CURRENT_TIMESTAMP,
      resolved_at=CASE WHEN ?='RESOLVED' THEN CURRENT_TIMESTAMP ELSE NULL END WHERE id=?`).run(next, next, requestId);
    db.prepare(`INSERT INTO request_events(request_id,actor_id,event_type,old_value,new_value) VALUES(?,?,'STATUS_CHANGED',?,?)`)
      .run(requestId, actor.id, request.status, next);
  });
}

export function assignContractor(db: DatabaseSync, actor: Actor, requestId: number, contractorId: number, assign: boolean) {
  if (actor.role !== 'MANAGER') throw new DomainError('Only property managers can change contractor assignments.', 403);
  const contractor = db.prepare("SELECT id,name FROM users WHERE id=? AND role='CONTRACTOR'").get(contractorId) as { id: number; name: string } | undefined;
  if (!contractor) throw new DomainError('Contractor not found.');
  if (!db.prepare('SELECT 1 FROM maintenance_requests WHERE id=?').get(requestId)) throw new DomainError('Request not found.', 404);
  transaction(db, () => {
    if (assign) {
      const result = db.prepare('INSERT OR IGNORE INTO request_assignments(request_id,contractor_id,assigned_by) VALUES(?,?,?)').run(requestId, contractorId, actor.id);
      if (result.changes) db.prepare(`INSERT INTO request_events(request_id,actor_id,event_type,new_value) VALUES(?,?,'ASSIGNED',?)`).run(requestId, actor.id, contractor.name);
    } else {
      const result = db.prepare('DELETE FROM request_assignments WHERE request_id=? AND contractor_id=?').run(requestId, contractorId);
      if (result.changes) db.prepare(`INSERT INTO request_events(request_id,actor_id,event_type,old_value) VALUES(?,?,'UNASSIGNED',?)`).run(requestId, actor.id, contractor.name);
    }
  });
}

export function transaction<T>(db: DatabaseSync, fn: () => T): T {
  db.exec('BEGIN IMMEDIATE');
  try { const value=fn(); db.exec('COMMIT'); return value; }
  catch (error) { db.exec('ROLLBACK'); throw error; }
}

export function paymentClassification(receivedCents: number, rentCents: number) {
  return receivedCents === rentCents ? 'matched' : receivedCents < rentCents ? 'underpaid' : 'overpaid';
}

export function monthKey(date = new Date()) { return date.toISOString().slice(0, 7); }

export function graceHasPassed(date = new Date(), graceDays = Number(process.env.GRACE_PERIOD_DAYS ?? 5)) {
  return date.getUTCDate() > graceDays;
}
