const idMap = {
  projects: {},  // hacknplanId → supabaseUUID
  boards: {},    // hacknplanId → supabaseUUID
  stages: {},    // `${projectId}:${stageId}` → statusString
};

export default idMap;
