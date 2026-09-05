import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/server.js';

let app: Awaited<ReturnType<typeof createApp>>['app'];
let db: Awaited<ReturnType<typeof createApp>>['db'];
beforeAll(async()=>({app,db}=await createApp(':memory:')));
afterAll(()=>db.close());

async function login(email:string){const agent=request.agent(app);await agent.post('/login').type('form').send({email,password:'DemoPass123!'}).expect(302);return agent;}

describe('server authorization',()=>{
  it('redirects anonymous users to login',()=>request(app).get('/').expect(302).expect('Location','/login'));
  it('lets a manager see rent data',async()=>{const agent=await login('manager@hearth.test');await agent.get('/rent').expect(200).expect(/Rent roll/)});
  it('retains the manager session after login',async()=>{const agent=await login('manager@hearth.test');await agent.get('/').expect(200).expect(/Good (morning|afternoon)/)});
  it('rejects contractor rent and unit access on the server',async()=>{const agent=await login('alex@hearth.test');await agent.get('/rent').expect(403);await agent.get('/units').expect(403)});
  it('only shows a contractor assigned requests',async()=>{const agent=await login('alex@hearth.test');const response=await agent.get('/requests').expect(200);expect(response.text).toContain('Kitchen faucet');expect(response.text).not.toContain('Bedroom radiator')});
  it('rejects a forged contractor assignment change',async()=>{const agent=await login('alex@hearth.test');await agent.post('/requests/1/assign').type('form').send({contractor_id:2,action:'remove'}).expect(403)});
});
