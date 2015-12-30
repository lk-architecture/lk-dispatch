import chai, {expect} from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import {isISO8601, isUUID} from "validator";

import getDispatch from "../src/get-dispatch";

chai.use(sinonChai);

describe("dispatch", () => {

    var clock;
    const kinesisClient = {
        putRecord: sinon.spy((arg, cb) => {
            cb(null, null);
        })
    };
    const dispatch = getDispatch({
        kinesisClient: kinesisClient,
        kinesisStream: "kinesisStream",
        producerId: "producerId"
    });

    before(() => {
        clock = sinon.useFakeTimers();
        getDispatch.__Rewire__("v4", () => "uuid");
    });
    after(() => {
        clock.restore();
        getDispatch.__ResetDependency__("v4");
    });
    beforeEach(() => {
        kinesisClient.putRecord.reset();
    });

    it("puts a record into kinesis [CASE: no options]", () => {
        return dispatch("eventType", {key: "value"})
            .then(() => {
                expect(kinesisClient.putRecord).to.have.been.calledWith({
                    Data: JSON.stringify({
                        id: "uuid",
                        type: "eventType",
                        data: {key: "value"},
                        timestamp: new Date().toISOString(),
                        source: {
                            userId: null,
                            producerId: "producerId"
                        }
                    }),
                    PartitionKey: "uuid",
                    StreamName: "kinesisStream"
                });
            });
    });

    it("puts a record into kinesis [CASE: sourceUserId specified]", () => {
        return dispatch("eventType", {key: "value"}, {sourceUserId: "sourceUserId"})
            .then(() => {
                expect(kinesisClient.putRecord).to.have.been.calledWith({
                    Data: JSON.stringify({
                        id: "uuid",
                        type: "eventType",
                        data: {key: "value"},
                        timestamp: new Date().toISOString(),
                        source: {
                            userId: "sourceUserId",
                            producerId: "producerId"
                        }
                    }),
                    PartitionKey: "uuid",
                    StreamName: "kinesisStream"
                });
            });
    });

    it("puts a record into kinesis [CASE: sourceUserId not specified]", () => {
        return dispatch("eventType", {key: "value"}, {})
            .then(() => {
                expect(kinesisClient.putRecord).to.have.been.calledWith({
                    Data: JSON.stringify({
                        id: "uuid",
                        type: "eventType",
                        data: {key: "value"},
                        timestamp: new Date().toISOString(),
                        source: {
                            userId: null,
                            producerId: "producerId"
                        }
                    }),
                    PartitionKey: "uuid",
                    StreamName: "kinesisStream"
                });
            });
    });

    it("puts a record into kinesis [CASE: partitionKey specified]", () => {
        return dispatch("eventType", {key: "value"}, {partitionKey: "partitionKey"})
            .then(() => {
                expect(kinesisClient.putRecord).to.have.been.calledWith({
                    Data: JSON.stringify({
                        id: "uuid",
                        type: "eventType",
                        data: {key: "value"},
                        timestamp: new Date().toISOString(),
                        source: {
                            userId: null,
                            producerId: "producerId"
                        }
                    }),
                    PartitionKey: "partitionKey",
                    StreamName: "kinesisStream"
                });
            });
    });

    it("puts a record into kinesis [CASE: partitionKey not specified]", () => {
        return dispatch("eventType", {key: "value"}, {})
            .then(() => {
                expect(kinesisClient.putRecord).to.have.been.calledWith({
                    Data: JSON.stringify({
                        id: "uuid",
                        type: "eventType",
                        data: {key: "value"},
                        timestamp: new Date().toISOString(),
                        source: {
                            userId: null,
                            producerId: "producerId"
                        }
                    }),
                    PartitionKey: "uuid",
                    StreamName: "kinesisStream"
                });
            });
    });

    it("returns the dispatched event", () => {
        return dispatch("eventType", {key: "value"})
            .then(event => {
                expect(event).to.deep.equal({
                    id: "uuid",
                    type: "eventType",
                    data: {key: "value"},
                    timestamp: new Date().toISOString(),
                    source: {
                        userId: null,
                        producerId: "producerId"
                    }
                });
            });
    });

});

describe("events", () => {

    const kinesisClient = {
        putRecord: (arg, cb) => {
            cb(null, null);
        }
    };
    const dispatch = getDispatch({
        kinesisClient: kinesisClient,
        kinesisStream: "kinesisStream",
        producerId: "producerId"
    });

    it("have an `id` property (uuid v4 string)", () => {
        return dispatch("eventType", {key: "value"}, {})
            .then(event => {
                expect(event.id).to.satisfy(id => isUUID(id, 4));
            });
    });

    it("have a `timestamp` property (ISO8601 string)", () => {
        return dispatch("eventType", {key: "value"}, {})
            .then(event => {
                expect(event.timestamp).to.satisfy(isISO8601);
            });
    });

    it("have a `type` property (string)", () => {
        return dispatch("eventType", {key: "value"}, {})
            .then(event => {
                expect(event.type).to.be.a("string");
                expect(event.type).to.equal("eventType");
            });
    });

    it("have a `data` property (any)", () => {
        return dispatch("eventType", {key: "value"}, {})
            .then(event => {
                expect(event.data).to.deep.equal({key: "value"});
            });
    });

    it("have a `source` property (object)", () => {
        return dispatch("eventType", {key: "value"}, {})
            .then(event => {
                expect(event.source).to.be.an("object");
                expect(event.source).to.deep.equal({
                    userId: null,
                    producerId: "producerId"
                });
            });
    });

});
