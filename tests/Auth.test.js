const request = require("supertest");
const express = require("express");
const router = require("../routes/Auth");
const { connectDB, closeConnectionToDB } = require("../config/database");

const app = express();
app.use(express.json());
app.use("/api", router);

jest.mock("../models/User", () => ({
    User: {
        findOne: jest.fn().mockImplementation((filter) => {
            if (filter.email === "abc@abc.com") {
                return Promise.resolve(null);
            } else {
                return Promise.resolve({
                    id: "123",
                    name: "test",
                    email: "test@test.com",
                    password: "a1s2d3f4",
                });
            }
        }),
    },
}));

jest.mock("bcrypt", () => ({
    compare: jest.fn().mockImplementation((typedPassword, searchedPassword) => {
        if (typedPassword === searchedPassword) {
            return true;
        } else {
            return false;
        }
    }),
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
