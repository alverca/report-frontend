"use strict";
/**
 * エラーコントローラー
 *
 * @namespace controller/error
 */
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = require("http-status");
function notFound(req, res) {
    const message = `router for [${req.originalUrl}] not found.`;
    if (req.get('accept').indexOf('application/json') >= 0) {
        res.status(http_status_1.NOT_FOUND).json({
            status: 'error',
            message
        });
    }
    else {
        res.status(http_status_1.NOT_FOUND).render('error/notFound', {
            message,
            layout: 'layouts/error'
        });
    }
}
exports.notFound = notFound;
function badRequest(err, req, res) {
    if (req.get('accept').indexOf('application/json') >= 0) {
        res.status(http_status_1.BAD_REQUEST).json({
            status: 'error',
            message: err.message
        });
    }
    else {
        res.status(http_status_1.BAD_REQUEST).render('error/badRequest', {
            message: err.message,
            layout: 'layouts/error'
        });
    }
}
exports.badRequest = badRequest;
function internalServerError(req, res) {
    const message = 'an unexpected error has occurred';
    if (req.get('accept').indexOf('application/json') >= 0) {
        res.status(http_status_1.INTERNAL_SERVER_ERROR).json({
            status: 'error',
            message
        });
    }
    else {
        res.status(http_status_1.INTERNAL_SERVER_ERROR).render('error/internalServerError', {
            message,
            layout: 'layouts/error'
        });
    }
}
exports.internalServerError = internalServerError;
