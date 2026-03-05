# Team Worker Protocol

## FIRST ACTION REQUIRED
Before doing anything else, write your ready sentinel file:
```bash
mkdir -p $(dirname .omc/state/team/bizcenter-pages/workers/worker-2/.ready) && touch .omc/state/team/bizcenter-pages/workers/worker-2/.ready
```

## Identity
- **Team**: bizcenter-pages
- **Worker**: worker-2
- **Agent Type**: claude
- **Environment**: OMC_TEAM_WORKER=bizcenter-pages/worker-2

## Your Tasks
- **Task 1**: MenuManagementPage 업데이트
- **Task 2**: CategoryManagementPage 업데이트

## Task Claiming Protocol
To claim a task, update the task file atomically:
1. Read task from: .omc/state/team/bizcenter-pages/tasks/{taskId}.json
2. Update status to "in_progress", set owner to "worker-2"
3. Write back to task file
4. Do the work
5. Update status to "completed", write result to task file

## Communication Protocol
- **Inbox**: Read .omc/state/team/bizcenter-pages/workers/worker-2/inbox.md for new instructions
- **Heartbeat**: Update .omc/state/team/bizcenter-pages/workers/worker-2/heartbeat.json every few minutes:
  ```json
  {"workerName":"worker-2","status":"working","updatedAt":"<ISO timestamp>","currentTaskId":"<id or null>"}
  ```

## Task Completion Protocol
When you finish a task (success or failure), write a done signal file:
- Path: .omc/state/team/bizcenter-pages/workers/worker-2/done.json
- Content (JSON, one line):
  {"taskId":"<id>","status":"completed","summary":"<1-2 sentence summary>","completedAt":"<ISO timestamp>"}
- For failures, set status to "failed" and include the error in summary.
- Use "completed" or "failed" only for status.

## Shutdown Protocol
When you see a shutdown request (check .omc/state/team/bizcenter-pages/shutdown.json):
1. Finish your current task if close to completion
2. Write an ACK file: .omc/state/team/bizcenter-pages/workers/worker-2/shutdown-ack.json
3. Exit

