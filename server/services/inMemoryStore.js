// In-memory data store strictly adhering to Zero Dummy Data:
// All stores initialize empty. No fake placeholder users or records exist.
export const memoryDb = {
  users: new Map(),
  familyMembers: new Map(),
  vitalsLogs: new Map(),
  prescriptions: new Map(),
  sosEvents: new Map(),
  hospitals: new Map(),
};

let nextIdCounter = 1001;
export function generateMemoryId() {
  return `mem_${nextIdCounter++}`;
}
