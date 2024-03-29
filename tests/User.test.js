const request = require("supertest");
const express = require("express");
const router = require("../routes/User");

const app = express();
app.use(express.json());
app.use("/api/users", router);

jest.mock("../middlewares/Token", () => jest.fn((req, res, next) => next()));

const data = [
    { id: 123, name: "test" },
    { id: 124, name: "test2" },
    { id: 125, name: "test3" },
];

jest.mock("../models/User", () => ({
    User: {
        findOne: jest.fn().mockImplementation(() => Promise.resolve(data[0])),
        find: jest.fn().mockImplementation(() => Promise.resolve(data)),
        findByIdAndUpdate: jest.fn().mockImplementation((id) => {
            return Promise.resolve({ ...data.find((d) => d.id === id) });
        }),
        findByIdAndDelete: jest
            .fn()
            .mockImplementation(() => Promise.resolve({})),
    },
}));

describe("GET /", () => {
    it("responds with json", async () => {
        const res = await request(app)
            .get("/api/users")
            .set("Accept", "application/json");

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(data);
    });
});

describe("PATCH /:id", () => {
    it("responds with json", async () => {
        const res = await request(app)
            .patch("/api/users/123")
            .send({ name: "new name" })
            .set("Accept", "application/json");

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("message");
    });
});

describe("DELETE /?id=123", () => {
    it("responds with json", async () => {
        const res = await request(app)
            .delete("/api/users?id=123")
            .set("Accept", "application/json");

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("message");
    });
});

describe("DELETE /?id=123", () => {
    it("bad request", async () => {
        const res = await request(app)
            .delete("/api/users")
            .set("Accept", "application/json");

        expect(res.statusCode).toEqual(400);
    });
});
