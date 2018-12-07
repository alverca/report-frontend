"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * デフォルトルーター
 */
const express = require("express");
const authentication_1 = require("../middlewares/authentication");
const api_1 = require("./api");
const income_1 = require("./income");
const auth_1 = require("./auth");
const router = express.Router();
router.use(auth_1.default);
router.use(authentication_1.default);
router.use('/api', api_1.default);
router.use('/income', income_1.default);
router.use('/', (_, res) => {
    res.redirect('/income');
});
exports.default = router;
