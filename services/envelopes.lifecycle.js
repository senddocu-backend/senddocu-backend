// services/envelopes.lifecycle.js

const STATES = {
  DRAFT: "DRAFT",
  CREATED: "CREATED",
  SENT: "SENT",
  VIEWED: "VIEWED",
  SIGNED: "SIGNED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  EXPIRED: "EXPIRED"
};

const ALLOWED_TRANSITIONS = {
  DRAFT: ["CREATED", "CANCELLED"],
  CREATED: ["SENT", "CANCELLED"],
  SENT: ["VIEWED", "EXPIRED", "CANCELLED"],
  VIEWED: ["SIGNED", "CANCELLED"],
  SIGNED: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
  EXPIRED: []
};

function canTransition(from, to) {
  return ALLOWED_TRANSITIONS[from]?.includes(to);
}

function assertTransition(from, to) {
  if (!canTransition(from, to)) {
    const err = new Error(`Invalid envelope transition: ${from} → ${to}`);
    err.code = "INVALID_ENVELOPE_STATE";
    throw err;
  }
}

module.exports = {
  STATES,
  canTransition,
  assertTransition
};
