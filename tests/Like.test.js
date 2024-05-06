const request = require("supertest");
const express = require("express");
const router = require("../routes/Like");

const app = express();
app.use(express.json());
app.use("/api/likes", router);

jest.mock("../middlewares/Token", () => jest.fn((req, res, next) => next()));

jest.mock("../models/Like", () => {
    return {
        save: jest.fn().mockImplementation(() => {
            return {};
        }),
    };
});

// describe("POST /api/likes", () => {
//     it("should return 201 and a message", async () => {
//         const response = await request(app)
//             .post("/api/likes")
//             .send({ postId: "123", userId: "456" });

//         console.log(response.body);

//         expect(response.statusCode).toBe(201);
//         expect(response.body).toEqual({ message: "Like created", like: {} });
//     });
// });
