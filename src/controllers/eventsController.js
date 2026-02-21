const { eventStore } = require('../store');
const { successRes } = require('../utils/response');

async function list(req, res) {
  const events = eventStore.getAll();
  return successRes(res, 200, events);
}

async function getById(req, res) {
  const event = eventStore.getByIdOrThrow(req.params.id);
  return successRes(res, 200, event);
}

async function create(req, res) {
  const { title, description, date, time } = req.body;
  const event = eventStore.create({
    title,
    description,
    date,
    time,
    organizerId: req.user.id,
  });
  return successRes(res, 201, event);
}

async function update(req, res) {
  const { title, description, date, time } = req.body;
  const event = eventStore.update(req.params.id, {
    ...(title !== undefined && { title }),
    ...(description !== undefined && { description }),
    ...(date !== undefined && { date }),
    ...(time !== undefined && { time }),
  });
  return successRes(res, 200, event);
}

async function remove(req, res) {
  eventStore.remove(req.params.id);
  return res.status(204).send();
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
};
