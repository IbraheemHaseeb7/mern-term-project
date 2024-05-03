const request = require("supertest");
const express = require("express");
const router = require("../routes/Auth");

const app = express();
app.use(express.json());
app.use("/api", router);

jest.mock("../models/User", () => {
    return {
        find: jest.fn().mockImplementation(() => {
            return [
                {
                    _id: "123",
                    name: "Test User",
                    email: "test@example.com",
                    password: "password",
                    joiningDate: new Date(),
                    friendsCount: 0,
                    friends: [],
                    bio: "This is a test user",
                    pictureUri: "http://example.com/picture.jpg",
                    coverUri: "http://example.com/cover.jpg",
                },
            ];
        }),
        findById: jest.fn().mockImplementation((id) => {
            return {
                _id: id,
                name: "Test User",
                email: "test@example.com",
                password: "password",
                joiningDate: new Date(),
                friendsCount: 0,
                friends: [],
                bio: "This is a test user",
                pictureUri: "http://example.com/picture.jpg",
                coverUri: "http://example.com/cover.jpg",
            };
        }),
        findOne: jest.fn().mockImplementation(({ email }) => {
            if (email === "abc@abc.com") {
                return null;
            }
            return {
                _id: "123",
                name: "Test User",
                email: "test@example.com",
                password: "a1s2d3f4",
                joiningDate: new Date(),
                friendsCount: 0,
                friends: [],
                bio: "This is a test user",
                pictureUri: "http://example.com/picture.jpg",
                coverUri: "http://example.com/cover.jpg",
            };
        }),
    };
});

jest.mock("bcrypt", () => ({
    compare: jest.fn().mockImplementation((typedPassword, searchedPassword) => {
        if (typedPassword === searchedPassword) {
            return true;
        } else {
            return false;
        }
    }),

    genSaltSync: jest.fn().mockImplementation(() => null),

    hash: jest.fn().mockImplementation((password, salt) => password),
}));

jest.mock("jsonwebtoken", () => ({
    sign: jest.fn().mockImplementation(() => "token"),
}));

describe("POST /login", () => {
    it("responds with json", async () => {
        const res = await request(app)
            .post("/api/token/login")
            .send({
                email: "test@test.com",
                password: "a1s2d3f4",
            })
            .set("Accept", "application/json");

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("message");
    });

    it("responds with 404 on user not found", async () => {
        const res = await request(app)
            .post("/api/token/login")
            .send({ email: "abc@abc.com", password: "a1s2d3f4" })
            .set("Accept", "application/json");

        expect(res.statusCode).toEqual(404);
    });

    it("responds with 400 on bad request", async () => {
        const res = await request(app)
            .post("/api/token/login")
            .send({
                email: "test@test.com",
            })
            .set("Accept", "application/json");

        expect(res.statusCode).toEqual(400);
    });

    it("responds with 400 on invalid password", async () => {
        const res = await request(app)
            .post("/api/token/login")
            .send({
                email: "test@test.com",
                password: "a1s2d3f5",
            })
            .set("Accept", "application/json");

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("message");
    });
});

describe("POST /signup", () => {
    it("responds with json", async () => {
        const res = await request(app).post("/api/token/signup").send({
            name: "Abc",
            email: "abc@abc.com",
            password: "a1s2d3f4",
            age: 20,
        });

        console.log("==============================");
        console.log(res.body);
        console.log("==============================");

        expect(res.statusCode).toEqual(200);
    });
});
