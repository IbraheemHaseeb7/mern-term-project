const request = require("supertest");
const express = require("express");
const router = require("../routes/User");

const app = express();
app.use(express.json());
app.use("/api/users", router);

jest.mock("../middlewares/Token", () => jest.fn((req, res, next) => next()));

const data = [
    {
        _id: "123",
        name: "Test User",
        email: "test@example.com",
        password: "password",
        joiningDate: "2021-09-01T00:00:00.000Z",
        friendsCount: 0,
        friends: [],
        bio: "This is a test user",
        pictureUri: "http://example.com/picture.jpg",
        coverUri: "http://example.com/cover.jpg",
    },
    {
        _id: "124",
        name: "Test User 2",
        email: "test2@example.com",
        password: "password",
        joiningDate: "2021-09-01T00:00:00.000Z",
        friendsCount: 0,
        friends: [],
        bio: "This is a test user 2",
        pictureUri: "http://example.com/picture2.jpg",
        coverUri: "http://example.com/cover2.jpg",
    },
    {
        _id: "125",
        name: "Test User 3",
        email: "test2@example.com",
        password: "password",
        joiningDate: "2021-09-01T00:00:00.000Z",
        friendsCount: 0,
        friends: [],
        bio: "This is a test user 3",
        pictureUri: "http://example.com/picture3.jpg",
        coverUri: "http://example.com/cover3.jpg",
    },
];

jest.mock("../models/User", () => {
    return {
        find: jest.fn().mockImplementation(() => {
            return [
                {
                    _id: "123",
                    name: "Test User",
                    email: "test@example.com",
                    password: "password",
                    joiningDate: "2021-09-01T00:00:00.000Z",
                    friendsCount: 0,
                    friends: [],
                    bio: "This is a test user",
                    pictureUri: "http://example.com/picture.jpg",
                    coverUri: "http://example.com/cover.jpg",
                },
                {
                    _id: "124",
                    name: "Test User 2",
                    email: "test2@example.com",
                    password: "password",
                    joiningDate: "2021-09-01T00:00:00.000Z",
                    friendsCount: 0,
                    friends: [],
                    bio: "This is a test user 2",
                    pictureUri: "http://example.com/picture2.jpg",
                    coverUri: "http://example.com/cover2.jpg",
                },
                {
                    _id: "125",
                    name: "Test User 3",
                    email: "test2@example.com",
                    password: "password",
                    joiningDate: "2021-09-01T00:00:00.000Z",
                    friendsCount: 0,
                    friends: [],
                    bio: "This is a test user 3",
                    pictureUri: "http://example.com/picture3.jpg",
                    coverUri: "http://example.com/cover3.jpg",
                },
            ];
        }),
        findById: jest.fn().mockImplementation((id) => {
            return {
                _id: id,
                name: "Test User",
                email: "test@example.com",
                password: "password",
                joiningDate: "2021-09-01T00:00:00.000Z",
                friendsCount: 0,
                friends: [],
                bio: "This is a test user",
                pictureUri: "http://example.com/picture.jpg",
                coverUri: "http://example.com/cover.jpg",
            };
        }),
        findByIdAndUpdate: jest.fn().mockImplementation((id, user) => {
            return {
                _id: id,
                name: user.name,
                email: user.email,
                password: user.password,
                joiningDate: user.joiningDate,
                friendsCount: user.friendsCount,
                friends: user.friends,
                bio: user.bio,
                pictureUri: user.pictureUri,
                coverUri: user.coverUri,
            };
        }),
        findByIdAndDelete: jest.fn().mockImplementation((id) => {
            return { message: "Successfully deleted one user" };
        }),
    };
});

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
