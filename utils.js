const userSteps = new Map();
const userAnswers = new Map();

function getNextStep(userId) {
  const step = userSteps.get(userId) || 0;
  userSteps.set(userId, step + 1);
  return step + 1;
}

function saveAnswer(userId, step, answer) {
  const answers = userAnswers.get(userId) || [];
  answers[step - 1] = answer;
  userAnswers.set(userId, answers);
}

function getUserAnswers(userId) {
  return userAnswers.get(userId) || [];
}

function resetUser(userId) {
  userSteps.delete(userId);
  userAnswers.delete(userId);
}

module.exports = {
  getNextStep,
  saveAnswer,
  getUserAnswers,
  resetUser
};
