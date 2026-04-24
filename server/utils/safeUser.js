const AUTH_MIDDLEWARE_SELECT = [
  "-password",
  "-twoFactorSecret",
  "-biometricId",
  "-faceAuth",
  "-credentials",
  "-securityLogs",
  "-registrationChallenge",
  "-registrationChallengeAt",
  "-authChallenge",
  "-authChallengeAt",
  "-authFlowVersion",
  "-totpFailures",
  "-totpLockUntil",
  "-loginFailures",
  "-loginLockUntil"
].join(" ");

const SENSITIVE_KEYS = [
  "password",
  "twoFactorSecret",
  "biometricId",
  "faceAuth",
  "credentials",
  "securityLogs",
  "registrationChallenge",
  "registrationChallengeAt",
  "authChallenge",
  "authChallengeAt",
  "sessionVersion",
  "authFlowVersion",
  "totpFailures",
  "totpLockUntil",
  "loginFailures",
  "loginLockUntil",
  "__v"
];

const toSafeUser = (user, req) => {
  if (!user) {
    return null;
  }

  const plain = typeof user.toObject === "function"
    ? user.toObject({ virtuals: true })
    : { ...user };

  SENSITIVE_KEYS.forEach((key) => {
    if (key in plain) {
      delete plain[key];
    }
  });

  if (!plain.id && plain._id) {
    plain.id = plain._id.toString?.() || plain._id;
  }

  if (req?.tenant) {
    plain.tenant = req.tenant;
  }

  return plain;
};

module.exports = {
  AUTH_MIDDLEWARE_SELECT,
  toSafeUser
};
