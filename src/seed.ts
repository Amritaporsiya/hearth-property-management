import bcrypt from 'bcryptjs';
import { openDatabase } from './db.js';

export async function seed(db = openDatabase()) {
  const hash = await bcrypt.hash('DemoPass123!', 10);
  const insertUser = db.prepare('INSERT OR IGNORE INTO users(name,email,password_hash,role) VALUES(?,?,?,?)');
  insertUser.run('Maya Chen', 'manager@hearth.test', hash, 'MANAGER');
  insertUser.run('Alex Rivera', 'alex@hearth.test', hash, 'CONTRACTOR');
  insertUser.run('Sam Okafor', 'sam@hearth.test', hash, 'CONTRACTOR');
  if ((db.prepare('SELECT count(*) n FROM units').get() as { n: number }).n) return;
  const manager = db.prepare("SELECT id FROM users WHERE role='MANAGER'").get() as { id: number };
  const alex = db.prepare("SELECT id FROM users WHERE email='alex@hearth.test'").get() as { id: number };
  const sam = db.prepare("SELECT id FROM users WHERE email='sam@hearth.test'").get() as { id: number };
  const addUnit = db.prepare('INSERT INTO units(unit_number,address,monthly_rent_cents,tenant_name) VALUES(?,?,?,?)');
  const units = [
    addUnit.run('1A', '18 Alder Street, Portland', 165000, 'Nora Patel').lastInsertRowid,
    addUnit.run('2B', '18 Alder Street, Portland', 178500, 'Jon Bell').lastInsertRowid,
    addUnit.run('7', '42 Cedar Avenue, Portland', 210000, 'Leah Kim').lastInsertRowid,
    addUnit.run('PH-2', '9 Harbor Way, Portland', 295000, 'Omar Lewis').lastInsertRowid,
  ];
  const nowMonth = new Date().toISOString().slice(0, 7);
  db.prepare('INSERT INTO rent_payments(unit_id,amount_cents,rent_month,recorded_by) VALUES(?,?,?,?)').run(units[0],165000,nowMonth,manager.id);
  db.prepare('INSERT INTO rent_payments(unit_id,amount_cents,rent_month,recorded_by) VALUES(?,?,?,?)').run(units[1],120000,nowMonth,manager.id);
  const addRequest = db.prepare('INSERT INTO maintenance_requests(unit_id,description,priority,status,created_by) VALUES(?,?,?,?,?)');
  const r1 = Number(addRequest.run(units[0], 'Kitchen faucet is leaking beneath the sink.', 'HIGH', 'TRIAGED', manager.id).lastInsertRowid);
  const r2 = Number(addRequest.run(units[2], 'Bedroom radiator makes a loud knocking noise.', 'MEDIUM', 'SCHEDULED', manager.id).lastInsertRowid);
  const r3 = Number(addRequest.run(units[3], 'Smoke detector chirps after battery replacement.', 'URGENT', 'REPORTED', manager.id).lastInsertRowid);
  const event = db.prepare("INSERT INTO request_events(request_id,actor_id,event_type,body) VALUES(?,?,'CREATED',?)");
  event.run(r1, manager.id, 'Request reported'); event.run(r2, manager.id, 'Request reported'); event.run(r3, manager.id, 'Request reported');
  db.prepare('INSERT INTO request_assignments(request_id,contractor_id,assigned_by) VALUES(?,?,?)').run(r1,alex.id,manager.id);
  db.prepare('INSERT INTO request_assignments(request_id,contractor_id,assigned_by) VALUES(?,?,?)').run(r2,sam.id,manager.id);
  db.prepare("INSERT INTO request_events(request_id,actor_id,event_type,old_value,new_value) VALUES(?,?,'STATUS_CHANGED','REPORTED','TRIAGED')").run(r1,manager.id);
  db.prepare("INSERT INTO request_events(request_id,actor_id,event_type,new_value) VALUES(?,?,'ASSIGNED','Alex Rivera')").run(r1,manager.id);
  db.prepare("INSERT INTO request_events(request_id,actor_id,event_type,old_value,new_value) VALUES(?,?,'STATUS_CHANGED','REPORTED','TRIAGED')").run(r2,manager.id);
  db.prepare("INSERT INTO request_events(request_id,actor_id,event_type,new_value) VALUES(?,?,'ASSIGNED','Sam Okafor')").run(r2,manager.id);
  db.prepare("INSERT INTO request_events(request_id,actor_id,event_type,old_value,new_value) VALUES(?,?,'STATUS_CHANGED','TRIAGED','SCHEDULED')").run(r2,manager.id);
}

if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) seed().then(() => console.log('Demo data ready.'));
