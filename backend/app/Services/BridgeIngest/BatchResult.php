<?php

namespace App\Services\BridgeIngest;

/**
 * Per-item outcome of a bridge batch, keyed by the bridge's own `ref`.
 *
 * accepted - stored (or intentionally ignored, e.g. stale state); the bridge deletes it
 * rejected - invalid and will never succeed; the bridge moves it to its dead-letter table
 * deferred - cannot be stored yet (unknown device); the bridge retries it later
 */
class BatchResult
{
    private array $accepted = [];
    private array $rejected = [];
    private array $deferred = [];

    public function accept(int $ref): void
    {
        $this->accepted[] = $ref;
    }

    public function acceptMany(array $refs): void
    {
        array_push($this->accepted, ...$refs);
    }

    public function reject(int $ref, array $errors): void
    {
        $this->rejected[] = ['ref' => $ref, 'errors' => $errors];
    }

    public function defer(int $ref, string $reason): void
    {
        $this->deferred[] = ['ref' => $ref, 'reason' => $reason];
    }

    public function toArray(): array
    {
        return [
            'accepted' => $this->accepted,
            'rejected' => $this->rejected,
            'deferred' => $this->deferred,
        ];
    }
}
