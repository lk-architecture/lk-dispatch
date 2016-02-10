import {v4} from "node-uuid";
import {promisify} from "bluebird";

export default function getDispatch (dispatchOptions) {
    const {
        kinesisClient,
        kinesisStream,
        producerId
    } = dispatchOptions;
    const putRecord = promisify(::kinesisClient.putRecord);
    return (type, data, options = {}) => {
        const kinesisPartitionKey = options.partitionKey || v4();
        const event = {
            id: v4(),
            type: type,
            data: data,
            timestamp: new Date().toISOString(),
            source: {
                userId: options.sourceUserId || null,
                producerId: producerId,
                kinesisPartitionKey: kinesisPartitionKey
            }
        };
        return putRecord({
            Data: JSON.stringify(event),
            PartitionKey: kinesisPartitionKey,
            StreamName: kinesisStream
        }).return(event);
    };
}
