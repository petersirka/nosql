const Fs = require('fs');
const ReadStream = Fs.ReadStream;
const Stream = require('stream');

/**
 * Destroy the stream
 * @param {Stream} stream
 * @return {Stream}
 * @author Jonathan Ong <me@jongleberry.com>
 * @license MIT
 * @see {@link https://github.com/stream-utils/destroy}
 */
function destroyStream(stream) {
	if (stream instanceof ReadStream) {
		stream.destroy();
		typeof(stream.close) === 'function' && stream.on('open', function() {
			typeof(this.fd) === 'number' && this.close();
		});
	} else if (stream instanceof Stream)
		typeof(stream.destroy) === 'function' && stream.destroy();
	return stream;
}

function isFinished(stream) {

	// Response & Request
	if (stream.socket) {
		if (stream.writable && (!stream.socket._writableState || stream.socket._writableState.finished || stream.socket._writableState.destroyed))
			return true;
		if (stream.readable && (!stream.socket._readableState|| stream.socket._writableState.ended || stream.socket._readableState.destroyed))
			return true;
		return false;
	}

	if (stream._readableState && (stream._readableState.ended || stream._readableState.destroyed))
		return true;

	if (stream._writableState && (stream._writableState.finished || stream._writableState.destroyed))
		return true;

	return false;
}

function onFinished(stream, fn) {

	if (stream.$onFinished) {
		fn && fn();
		fn = null;
		return;
	}

	if (stream.$onFinishedQueue) {
		if (stream.$onFinishedQueue instanceof Array)
			stream.$onFinishedQueue.push(fn);
		else
			stream.$onFinishedQueue = [stream.$onFinishedQueue, fn];
		return;
	} else
		stream.$onFinishedQueue = fn;

	var callback = function() {
		!stream.$onFinished && (stream.$onFinished = true);
		if (stream.$onFinishedQueue instanceof Array) {
			while (stream.$onFinishedQueue.length)
				stream.$onFinishedQueue.shift()();
			stream.$onFinishedQueue = null;
		} else if (stream.$onFinishedQueue) {
			stream.$onFinishedQueue();
			stream.$onFinishedQueue = null;
		}
	};

	if (isFinished(stream)) {
		setImmediate(callback);
	} else {

		if (stream.socket) {
			if (!stream.socket.$totalstream) {
				stream.socket.$totalstream = stream;
				if (stream.socket.prependListener) {
					stream.socket.prependListener('error', callback);
					stream.socket.prependListener('close', callback);
				} else {
					stream.socket.on('error', callback);
					stream.socket.on('close', callback);
				}
			}
		}

		if (stream.prependListener) {
			stream.prependListener('error', callback);
			stream.prependListener('end', callback);
			stream.prependListener('close', callback);
			stream.prependListener('aborted', callback);
			stream.prependListener('finish', callback);
		} else {
			stream.on('error', callback);
			stream.on('end', callback);
			stream.on('close', callback);
			stream.on('aborted', callback);
			stream.on('finish', callback);
		}

		//stream.uri --> determines ServerRespone
		// stream.uri && stream.prependListener('aborted', callback);
		// (stream._writableState || stream.uri) && stream.prependListener('finish', callback);
	}
}

exports.onFinished = onFinished;
exports.destroyStream = destroyStream;