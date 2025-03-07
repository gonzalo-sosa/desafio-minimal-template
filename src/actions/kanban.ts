import type { UniqueIdentifier } from '@dnd-kit/core';
import type { QueryFilters } from '@tanstack/react-query';
import type { IKanban, IKanbanTask, IKanbanColumn } from 'src/types/kanban';

import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import axios, { fetcher, endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

const enableServer = false;

const KANBAN_ENDPOINT = endpoints.kanban;

// TODO: añadir types de useQuery
const queryOptions = {
  refetchOnWindowFocus: enableServer,
  refetchOnMount: enableServer,
  refetchOnReconnect: enableServer,
};

// ----------------------------------------------------------------------

type BoardData = {
  board: IKanban;
};

export function useGetBoard() {
  const {
    data,
    isLoading,
    error,
    isFetching: isValidating,
  } = useQuery<BoardData>({
    queryKey: ['board'],
    queryFn: () => fetcher<BoardData>(KANBAN_ENDPOINT),
    ...queryOptions,
  });

  const memoizedValue = useMemo(() => {
    const tasks = data?.board.tasks ?? {};
    const columns = data?.board.columns ?? [];

    return {
      board: { tasks, columns },
      boardLoading: isLoading,
      boardError: error,
      boardValidating: isValidating,
      boardEmpty: !isLoading && !isValidating && !columns.length,
    };
  }, [data?.board.columns, data?.board.tasks, error, isLoading, isValidating]);

  return memoizedValue;
}

// #region useKanbanMutations

export function useKanbanMutations() {
  const queryClient = useQueryClient();

  const createColumnMutation = useMutation({
    mutationFn: async (columnData: IKanbanColumn) => {
      if (enableServer) {
        const response = await axios.post<{ column: IKanbanColumn }>(
          KANBAN_ENDPOINT,
          { columnData },
          { params: { endpoint: 'create-column' } }
        );

        return response.data.column;
      }

      return columnData;
    },
    onSuccess: (serverColumn) => {
      queryClient.setQueryData<BoardData>(['board'], (old) => {
        const board = old?.board ?? { columns: [], tasks: {} };
        return {
          board: {
            columns: [...board.columns, serverColumn],
            tasks: { ...board.tasks, [serverColumn.id]: [] },
          },
        };
      });
    },
  });

  const updateColumnMutation = useMutation({
    mutationFn: async ({
      columnId,
      columnName,
    }: {
      columnId: UniqueIdentifier;
      columnName: string;
    }) => {
      if (enableServer) {
        await axios.post(
          KANBAN_ENDPOINT,
          { columnId, columnName },
          {
            params: { endpoint: 'update-column' },
          }
        );
      }
      return { columnId, columnName };
    },
    onSuccess: ({ columnId, columnName }) => {
      queryClient.setQueryData<BoardData>(['board'], (old) => {
        const board = old?.board ?? { columns: [], tasks: {} };
        return {
          board: {
            ...board,
            columns: board.columns.map((col) =>
              col.id === columnId ? { ...col, name: columnName } : col
            ),
          },
        };
      });
    },
  });

  const moveColumnMutation = useMutation({
    mutationFn: async (updateColumns: IKanbanColumn[]) => {
      if (enableServer) {
        await axios.post(
          KANBAN_ENDPOINT,
          { updateColumns },
          {
            params: { endpoint: 'move-column' },
          }
        );
      }
      return updateColumns;
    },
    onSuccess: (updateColumns) => {
      queryClient.setQueryData<BoardData>(['board'], (old) => {
        if (!old)
          return {
            board: {
              columns: [],
              tasks: {},
            },
          };

        return {
          board: { ...old.board, columns: updateColumns },
        };
      });
    },
  });

  const clearColumnMutation = useMutation({
    mutationFn: async (columnId: UniqueIdentifier) => {
      if (enableServer) {
        await axios.post(
          KANBAN_ENDPOINT,
          { columnId },
          {
            params: { endpoint: 'clear-column' },
          }
        );
      }
      return columnId;
    },
    onSuccess: (columnId) => {
      queryClient.setQueryData<BoardData>(['board'], (old) => {
        const board = old?.board ?? { columns: [], tasks: {} };
        return {
          board: {
            ...board,
            tasks: { ...board.tasks, [columnId]: [] },
          },
        };
      });
    },
  });

  const deleteColumnMutation = useMutation({
    mutationFn: async (columnId: UniqueIdentifier) => {
      if (enableServer) {
        await axios.post(
          KANBAN_ENDPOINT,
          { columnId },
          {
            params: { endpoint: 'delete-column' },
          }
        );
      }
      return columnId;
    },
    onSuccess: (columnId) => {
      queryClient.setQueryData<BoardData>(['board'], (old) => {
        const board = old?.board ?? { columns: [], tasks: {} };
        const columns = board.columns.filter((col) => col.id !== columnId);
        const tasks = Object.keys(board.tasks)
          .filter((key) => key !== columnId)
          .reduce((obj: IKanban['tasks'], key) => {
            obj[key] = board.tasks[key];
            return obj;
          }, {});

        return { board: { columns, tasks } };
      });
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async ({
      columnId,
      taskData,
    }: {
      columnId: UniqueIdentifier;
      taskData: IKanbanTask;
    }) => {
      if (enableServer) {
        const response = await axios.post<{ task: IKanbanTask }>(
          KANBAN_ENDPOINT,
          { columnId, taskData },
          { params: { endpoint: 'create-task' } }
        );
        return { columnId, taskData: response.data.task };
      }
      return { columnId, taskData };
    },
    onMutate: async ({ columnId, taskData }) => {
      await queryClient.cancelQueries(['board'] as QueryFilters);

      const previousBoard = queryClient.getQueryData<BoardData>(['board']);

      // Actualización optimista
      queryClient.setQueryData<BoardData>(['board'], (old) => {
        const board = old?.board ?? { columns: [], tasks: {} };
        return {
          board: {
            ...board,
            tasks: {
              ...board.tasks,
              [columnId]: [taskData, ...(board.tasks[columnId] || [])],
            },
          },
        };
      });

      return { previousBoard };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['board'], context?.previousBoard);
    },
    onSuccess: ({ columnId, taskData }) => {
      // Confirmar datos si es necesario
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({
      columnId,
      taskData,
    }: {
      columnId: UniqueIdentifier;
      taskData: IKanbanTask;
    }) => {
      if (enableServer) {
        await axios.post(
          KANBAN_ENDPOINT,
          { columnId, taskData },
          {
            params: { endpoint: 'update-task' },
          }
        );
      }
      return { columnId, taskData };
    },
    onSuccess: ({ columnId, taskData }) => {
      queryClient.setQueryData<BoardData>(['board'], (old) => {
        const board = old?.board ?? { columns: [], tasks: {} };
        return {
          board: {
            ...board,
            tasks: {
              ...board.tasks,
              [columnId]: board.tasks[columnId].map((task) =>
                task.id === taskData.id ? taskData : task
              ),
            },
          },
        };
      });
    },
  });

  const moveTaskMutation = useMutation({
    mutationFn: async (updateTasks: IKanban['tasks']) => {
      if (enableServer) {
        await axios.post(
          KANBAN_ENDPOINT,
          { updateTasks },
          {
            params: { endpoint: 'move-task' },
          }
        );
      }
      return updateTasks;
    },
    onSuccess: (updateTasks) => {
      queryClient.setQueryData<BoardData>(['board'], (old) => {
        if (!old)
          return {
            board: { columns: [], tasks: {} },
          };

        return {
          board: { ...old.board, tasks: updateTasks },
        };
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async ({
      columnId,
      taskId,
    }: {
      columnId: UniqueIdentifier;
      taskId: UniqueIdentifier;
    }) => {
      if (enableServer) {
        await axios.post(
          KANBAN_ENDPOINT,
          { columnId, taskId },
          {
            params: { endpoint: 'delete-task' },
          }
        );
      }
      return { columnId, taskId };
    },
    onSuccess: ({ columnId, taskId }) => {
      queryClient.setQueryData<BoardData>(['board'], (old) => {
        const board = old?.board ?? { columns: [], tasks: {} };
        return {
          board: {
            ...board,
            tasks: {
              ...board.tasks,
              [columnId]: board.tasks[columnId].filter((task) => task.id !== taskId),
            },
          },
        };
      });
    },
  });

  return {
    columnMutation: {
      createColumn: createColumnMutation.mutateAsync,
      updateColumn: updateColumnMutation.mutateAsync,
      moveColumn: moveColumnMutation.mutateAsync,
      clearColumn: clearColumnMutation.mutateAsync,
      deleteColumn: deleteColumnMutation.mutateAsync,
      isCreatingColumn: createColumnMutation.isPending,
      isUpdatingColumn: updateColumnMutation.isPending,
      isMovingColumn: moveColumnMutation.isPending,
      isClearingColumn: clearColumnMutation.isPending,
      isDeletingColumn: deleteColumnMutation.isPending,
    },
    taskMutation: {
      createTask: createTaskMutation.mutateAsync,
      updateTask: updateTaskMutation.mutateAsync,
      moveTask: moveTaskMutation.mutateAsync,
      deleteTask: deleteTaskMutation.mutateAsync,
      isCreatingTask: createTaskMutation.isPending,
      isUpdatingTask: updateTaskMutation.isPending,
      isMovingTask: moveTaskMutation.isPending,
      isDeletingTask: deleteTaskMutation.isPending,
    },
  };
}

// #endregion
