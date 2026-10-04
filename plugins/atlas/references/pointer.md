## Atlas workspace

`.workspace/` in this repository holds the business context and the C4 model of the system as an OKF bundle.

- Read `.workspace/index.md` first. Open only the nodes that the task needs.
- Change the bundle through the `atlas` skills.
- A node with `status: draft` has no human review yet.
- A node with `realization: planned` describes the target. The code must match it.
- A node with `realization: built` describes the code. If the node and the code differ, the code is right.
