const voidRequestsService = require('../services/voidRequests.service');

const createVoidRequest = async (req, res, next) => {
    try {
        console.log('=== CREATE VOID REQUEST ===');
        console.log('User:', req.user);
        console.log('Body:', req.body);
        console.log('========================');

        const data = await voidRequestsService.createVoidRequest(req.user, req.body);
        res.status(201).json(data);
    } catch (err) {
        console.error('❌ Error creating void request:', err.message);
        console.error('Stack:', err.stack);
        next(err);
    }
};

const listVoidRequests = async (req, res, next) => {
    try {
        const data = await voidRequestsService.listVoidRequests(req.query);
        res.json(data);
    } catch (err) {
        next(err);
    }
};

const approveVoidRequest = async (req, res, next) => {
    try {
        const data = await voidRequestsService.approveVoidRequest(req.params.id, req.body, req.user);
        await voidRequestsService.notifyKdsAfterApproval();
        res.json(data);
    } catch (err) {
        next(err);
    }
};

const rejectVoidRequest = async (req, res, next) => {
    try {
        const data = await voidRequestsService.rejectVoidRequest(req.params.id, req.body, req.user);
        res.json(data);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createVoidRequest,
    listVoidRequests,
    approveVoidRequest,
    rejectVoidRequest,
};
