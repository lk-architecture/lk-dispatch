[![npm version](https://badge.fury.io/js/lk-dispatch.svg)](https://badge.fury.io/js/lk-dispatch)
[![Build Status](https://travis-ci.org/lk-architecture/lk-dispatch.svg?branch=master)](https://travis-ci.org/lk-architecture/lk-dispatch)
[![codecov.io](https://codecov.io/github/lk-architecture/lk-dispatch/coverage.svg?branch=master)](https://codecov.io/github/lk-architecture/lk-dispatch?branch=master)
[![Dependency Status](https://david-dm.org/lk-architecture/lk-dispatch.svg)](https://david-dm.org/lk-architecture/lk-dispatch)
[![devDependency Status](https://david-dm.org/lk-architecture/lk-dispatch/dev-status.svg)](https://david-dm.org/lk-architecture/lk-dispatch#info=devDependencies)

# lk-dispatch

Canonical way to dispatch events to kinesis in the lk-architecture.

## Usage

```js
import {Kinesis} from "aws-sdk";
import getDispatch from "lk-dispatch";

const kinesis = new Kinesis();

const dispatch = getDispatch({
    kinesisClient: kinesis,
    kinesisStream: "entrypoint",
    producerId: "server@hostname"
});

const eventType = "eventType";
const eventData = {
    key: "value"
};
const eventOptions = {
    sourceUserId: "userId",
    partitionKey: "partitionKey"
};
dispatch(eventType, eventData, eventOptions)
    .then(event => {
        console.log(`Event ${event.id} inserted in kinesis`);
    });
```

## Api

#### getDispatch(options)

Get the dispatch function.

**Params**

- `options`:
  - `kinesisClient`: `AWS.Kinesis` instance
  - `kinesisStream`: name of the kinesis stream where events will be published
  - `producerId`: a token to identify where events come from (will end up in
    `event.source.producerId`)

**Return value**

The dispatch function.

#### dispatch(type, data, options)

The dispatch function, publishes event to the configured kinesis stream.

**Params**

- `type`: the type of the event
- `data`: the data of the event
- `options` (optional):
  - `sourceUserId (optional)`: the id of the user which triggered the operation
    that generated the event
  - `partitionKey` (optional): kinesis stream partition where to publish the
    event

**Return value**

A Promise that will be resolved with the published event when said event has
been successfully published to kinesis.
