const crypto = require('crypto'),
      worker_threads = require('worker_threads'),
      argv = worker_threads.workerData || require('yargs').argv,
      Disruptor = require('../..').Disruptor,
      d = new Disruptor('/test', 1000, 256, argv.num_consumers, 0, false, true);

console.log('PRODUCER START', process.pid);

(async () => {

let sum = 0;

for (let i = 0; i < argv.num_elements_to_write; i += 1) {
    console.log('PRODUCER +WRITE', process.pid, i);
    let { buf } = await d.produceClaim();

    crypto.randomFillSync(buf);

    for (let j = 0; j < buf.length; j += 1) {
        sum += buf[j];
    }

    console.log('PRODUCER -WRITE', process.pid, i);

    await d.produceCommit();
}

console.log('PRODUCER END', process.pid);
if (worker_threads.parentPort) {
    worker_threads.parentPort.postMessage(sum);
} else {
    process.send(sum);
}

})();
