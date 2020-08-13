# Dynamic Config Variables

Most config variables are designed to be _static_: read once on startup, and then 'frozen' in memory for the duration of the running process.

It can be helpful to designate a small subset of variables as _dynamic_ that are intended to be modified at runtime (e.g., [Feature Toggles](https://www.martinfowler.com/articles/feature-toggles.html)).