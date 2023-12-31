const request = require('supertest');
const app = require('../../app');
const{ mongoConnect,
    mongoDisconnect

}=require('../../services/mongo');

describe('Launch API',()=>{
    beforeAll(async ()=>{
       await mongoConnect();
    })
// afterAll(async ()=>{
//     await mongoDisconnect();
// })

    describe('Test GET /launches', () => {
        test('It should respond with 200 success', async () => {
            const response = await request(app).get('/v1/launches')
                .expect(200)
        })
    })
    
    describe('Test POST /launch', () => {
        const completeLaunchData = {
            mission: 'USS Enterprise',
            rocket: 'NCC 1701-D',
            target: 'Kepler-186 f',
            launchDate: 'January 4 2028'
        };
    
        const launchDateWithoutDate = {
            mission: 'USS Enterprise',
            rocket: 'NCC 1701-D',
            target: 'Kepler-186 f'
        }
    
    const launchDateWithInvalid={
        mission: 'USS Enterprise',
        rocket: 'NCC 1701-D',
        target: 'Kepler-186 f',
        launchDate: 'zoot'
    }
    
    
        test('It should respond with 201 success ', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(completeLaunchData)
                .expect('Content-Type', /json/).expect(201);
    
            const requestDate = new Date(completeLaunchData.launchDate).valueOf();
            const responseDate = new Date(response.body.launchDate).valueOf();
            expect(requestDate).toBe(responseDate);
    
            expect(response.body).toMatchObject(launchDateWithoutDate);
    
        })
        test('It should catch missing required properties', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(launchDateWithoutDate)
                .expect(400);
            expect(response.body).toStrictEqual({
                error: "Miising ! required launch property",
            })
        })
        test('It should catch invalid dates', async() => {
            const response = await request(app)
            .post('/v1/launches')
            .send(launchDateWithInvalid)
            .expect(400);
        expect(response.body).toStrictEqual({
            error:'Invalid launch  date'
        })
        })
    
    })
})

