// services/envelope.lifecycle.js

const STATES = {
  DRAFT: "DRAFT",
  SENT: "SENT",
  VIEWED: "VIEWED",
  SIGNED: "SIGNED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  EXPIRED: "EXPIRED"
};

const TRANSITIONS = {
  DRAFT: ["SENT", "CANCELLED"],
  SENT: ["VIEWED", "CANCELLED", "EXPIRED"],
  VIEWED: ["SIGNED", "CANCELLED", "EXPIRED"],
  SIGNED: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
  EXPIRED: []
};

function canTransition(from, to) {
  return TRANSITIONS[from]?.includes(to);
}

function assertTransition(from, to) {
  if (!canTransition(from, to)) {
    throw new Error(`INVALID_TRANSITION: ${from} → ${to}`);
  }
}

module.exports = {
  STATES,
  canTransition,
  assertTransition
};
