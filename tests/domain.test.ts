import { beforeEach, describe, expect, it } from 'vitest';
import { openDatabase } from '../src/db.js';
import { assignContractor, DomainError, transitionRequest } from '../src/domain.js';
import type { DatabaseSync } from 'node:sqlite';

let db: DatabaseSync;
const manager={id:1,name:'Manager',email:'m@test.dev',role:'MANAGER' as const};
const contractor={id:2,name:'Contractor',email:'c@test.dev',role:'CONTRACTOR' as const};
beforeEach(()=>{db=openDatabase(':memory:');const add=db.prepare('INSERT INTO users(id,name,email,password_hash,role) VALUES(?,?,?,?,?)');add.run(1,'Manager','m@test.dev','x','MANAGER');add.run(2,'Contractor','c@test.dev','x','CONTRACTOR');db.prepare("INSERT INTO units(id,unit_number,address,monthly_rent_cents,tenant_name) VALUES(1,'1A','A Street',100000,'Tenant')").run();db.prepare("INSERT INTO maintenance_requests(id,unit_id,description,priority,created_by) VALUES(1,1,'Broken tap','HIGH',1)").run();});
describe('maintenance lifecycle',()=>{
  it('rejects skipping states',()=>expect(()=>transitionRequest(db,manager,1,'SCHEDULED')).toThrow(/Cannot move/));
  it('requires an assignee before Scheduled',()=>{transitionRequest(db,manager,1,'TRIAGED');expect(()=>transitionRequest(db,manager,1,'SCHEDULED')).toThrow(/Assign at least/)});
  it('supports the valid path and reopens to Triaged',()=>{assignContractor(db,manager,1,2,true);transitionRequest(db,manager,1,'TRIAGED');transitionRequest(db,contractor,1,'SCHEDULED');transitionRequest(db,contractor,1,'RESOLVED');transitionRequest(db,contractor,1,'TRIAGED');expect((db.prepare('SELECT status FROM maintenance_requests WHERE id=1').get() as any).status).toBe('TRIAGED')});
  it('prevents contractors changing assignments',()=>expect(()=>assignContractor(db,contractor,1,2,true)).toThrowError(DomainError));
  it('makes history immutable at the database boundary',()=>{assignContractor(db,manager,1,2,true);expect(()=>db.prepare('DELETE FROM request_events').run()).toThrow(/immutable/)});
});
