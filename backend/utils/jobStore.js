const jobs = new Map();

const createJob = (jobId) => {
    jobs.set(jobId, {
        status: 'pending',
        progress: 0,
        total: 0,
        changed: 0,
        failed: 0,
        creditsUsed: 0,
        message: 'Starting...',
        downloadPath: null,
        error: null,
    });
};

const updateJob = (jobId, updates) => {
    const job = jobs.get(jobId);
    if (job) jobs.set(jobId, { ...job, ...updates });
};

const getJob = (jobId) => jobs.get(jobId);

const deleteJob = (jobId) => jobs.delete(jobId);

module.exports = { createJob, updateJob, getJob, deleteJob };