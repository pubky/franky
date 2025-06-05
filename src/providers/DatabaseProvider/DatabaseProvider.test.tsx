import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { DatabaseProvider, DatabaseContext, type DatabaseContextType } from '@/providers';
import { db } from '@/core';
import { DatabaseErrorType, createDatabaseError } from '@/libs';

// Mock the database
vi.mock('@/database', () => ({
  db: {
    initialize: vi.fn(),
  },
}));

describe('DatabaseProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize database successfully', async () => {
    vi.spyOn(db, 'initialize').mockResolvedValueOnce();

    render(
      <DatabaseProvider>
        <div>Test Content</div>
      </DatabaseProvider>,
    );

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(db.initialize).toHaveBeenCalledTimes(1);
  });

  it('should handle database initialization error', async () => {
    const error = createDatabaseError(DatabaseErrorType.DB_INIT_FAILED, 'Failed to initialize database', 500, {
      reason: 'test error',
    });

    vi.spyOn(db, 'initialize').mockRejectedValueOnce(error);

    const contextRef = { current: null as DatabaseContextType | null };
    render(
      <DatabaseProvider>
        <DatabaseContext.Consumer>
          {(value) => {
            contextRef.current = value;
            return null;
          }}
        </DatabaseContext.Consumer>
      </DatabaseProvider>,
    );

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    const context = contextRef.current;
    expect(context).not.toBeNull();
    expect(context?.error).toBeDefined();
    expect(context?.isReady).toBe(false);
    expect(context?.error?.type).toBe(DatabaseErrorType.DB_INIT_FAILED);
    expect(context?.error?.statusCode).toBe(500);
    expect(context?.error?.details).toEqual({ reason: 'test error' });
  });

  it('should handle retry initialization', async () => {
    const error = createDatabaseError(DatabaseErrorType.DB_INIT_FAILED, 'Failed to initialize database', 500);

    // Mock db.initialize to fail once then succeed
    const initializeMock = vi.spyOn(db, 'initialize');
    initializeMock
      .mockRejectedValueOnce(error) // First call fails
      .mockResolvedValueOnce(); // Second call succeeds

    const contextRef = { current: null as DatabaseContextType | null };
    render(
      <DatabaseProvider>
        <DatabaseContext.Consumer>
          {(value) => {
            contextRef.current = value;
            return null;
          }}
        </DatabaseContext.Consumer>
      </DatabaseProvider>,
    );

    // Wait for initial error state
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    const context = contextRef.current;
    expect(context).not.toBeNull();
    expect(context?.error).toBeDefined();
    expect(context?.isReady).toBe(false);

    if (!context) throw new Error('Context should not be null');

    // Trigger retry and wait for success
    await act(async () => {
      await context.retry();
      await vi.runAllTimersAsync();
    });

    // Get the updated context from the same reference
    const updatedContext = contextRef.current;
    expect(updatedContext).not.toBeNull();
    if (!updatedContext) throw new Error('Context should not be null');
    expect(updatedContext.error).toBeNull();
    expect(updatedContext.isReady).toBe(true);
    expect(initializeMock).toHaveBeenCalledTimes(2);
  });

  it('should handle unexpected errors', async () => {
    const unexpectedError = new Error('Unexpected error');
    vi.spyOn(db, 'initialize').mockRejectedValueOnce(unexpectedError);

    const contextRef = { current: null as DatabaseContextType | null };
    render(
      <DatabaseProvider>
        <DatabaseContext.Consumer>
          {(value) => {
            contextRef.current = value;
            return null;
          }}
        </DatabaseContext.Consumer>
      </DatabaseProvider>,
    );

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    const context = contextRef.current;
    expect(context).not.toBeNull();
    expect(context?.error).toBeDefined();
    expect(context?.isReady).toBe(false);
    expect(context?.error?.type).toBe(DatabaseErrorType.DB_INIT_FAILED);
    expect(context?.error?.statusCode).toBe(500);
    expect(context?.error?.details).toEqual({ originalError: unexpectedError });
  });
});
