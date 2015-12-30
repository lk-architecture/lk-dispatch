import {v4} from "node-uuid";
import {promisify} from "bluebird";

/**
*   Create an array of all the right files in the source dir
*   @param      {String}   source path
*   @param      {Object}   options
*   @param      {Function} callback
*   @jsFiddle   A jsFiddle embed URL
*   @return     {Array} an array of string path
*/
export default function getDispatch (dispatchOptions) {
    const {
        kinesisClient,
        kinesisStream,
        producerId
    } = dispatchOptions;
    const putRecord = promisify(::kinesisClient.putRecord);
    return (type, data, options = {}) => {
        const event = {
            id: v4(),
            type: type,
            data: data,
            timestamp: new Date().toISOString(),
            source: {
                userId: options.sourceUserId || null,
                producerId: producerId
            }
        };
        return putRecord({
            Data: JSON.stringify(event),
            PartitionKey: options.partitionKey || v4(),
            StreamName: kinesisStream
        }).return(event);
    };
}
