# example
This example shows how `barracks` would work in a Flux application.

# usage
If you're going to test this example you'll probably want to run it through
`browserify` first. This code hasn't been tested, though most likely will work.
If you encounter any bugs you can report them [here][issues].

# modules
- `modules/index`: render the React view on a DOM element.
- `views/home`: contains the logic for setting up a React view.
- `stores/user`: contains the user data and emits events. In larger applications
the store would be the part responsible for talking to the backend.
- `dispatcher/dispatcher`: propagates events to the corresponding store. Turns
store calls into a more loosely coupled, reusable system.
- `dispatcher/user`: contains the logic responsible for calling the store. I
prefer to keep separate files per store in my dispatcher folder, exposing them
through `dispatcher/dispatcher`.

[issues]: http://github.com/yoshuawuyts/barracks/issues
