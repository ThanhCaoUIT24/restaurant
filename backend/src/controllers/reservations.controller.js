const reservationsService = require('../services/reservations.service');

const listReservations = async (req, res, next) => {
  try {
    const data = await reservationsService.list(req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const createReservation = async (req, res, next) => {
  try {
    const data = await reservationsService.create(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

const updateReservationStatus = async (req, res, next) => {
  try {
    const data = await reservationsService.updateStatus(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

module.exports = { listReservations, createReservation, updateReservationStatus };
