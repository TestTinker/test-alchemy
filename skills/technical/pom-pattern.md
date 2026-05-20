# POM Pattern

Page objects should hide selectors and low-level browser actions. They should not contain business workflow orchestration; that belongs in `flows/`.

Keep methods task-oriented, for example `login`, `openDashboard`, or `submitOrder`.
