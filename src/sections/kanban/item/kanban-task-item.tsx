import type { IKanbanTask } from 'src/types/kanban';
import type { UniqueIdentifier } from '@dnd-kit/core';
import type { Theme, SxProps } from '@mui/material/styles';

import { useSortable } from '@dnd-kit/sortable';
import { useBoolean } from 'minimal-shared/hooks';
import { useState, useEffect, useCallback } from 'react';

import { useKanbanMutations } from 'src/actions/kanban';

import { toast } from 'src/components/snackbar';

import ItemBase from './item-base';
import { KanbanDetails } from '../details/kanban-details';

// ----------------------------------------------------------------------

type TaskItemProps = {
  disabled?: boolean;
  sx?: SxProps<Theme>;
  task: IKanbanTask;
  columnId: UniqueIdentifier;
};

export function KanbanTaskItem({ task, disabled, columnId, sx }: TaskItemProps) {
  const taskDetailsDialog = useBoolean();

  const { taskMutation } = useKanbanMutations();

  const { setNodeRef, listeners, isDragging, isSorting, transform, transition } = useSortable({
    id: task?.id,
  });

  const mounted = useMountStatus();
  const mountedWhileDragging = isDragging && !mounted;

  const handleDeleteTask = useCallback(async () => {
    try {
      taskMutation.deleteTask({ columnId, taskId: task.id });
      toast.success('Delete success!', { position: 'top-center' });
    } catch (error) {
      console.error(error);
    }
  }, [columnId, task.id, taskMutation]);

  const handleUpdateTask = useCallback(
    async (taskData: IKanbanTask) => {
      try {
        taskMutation.updateTask({ columnId, taskData });
      } catch (error) {
        console.error(error);
      }
    },
    [columnId, taskMutation]
  );

  const renderTaskDetailsDialog = () => (
    <KanbanDetails
      task={task}
      open={taskDetailsDialog.value}
      onClose={taskDetailsDialog.onFalse}
      onUpdateTask={handleUpdateTask}
      onDeleteTask={handleDeleteTask}
    />
  );

  return (
    <>
      <ItemBase
        ref={disabled ? undefined : setNodeRef}
        task={task}
        open={taskDetailsDialog.value}
        onClick={taskDetailsDialog.onTrue}
        stateProps={{
          transform,
          listeners,
          transition,
          sorting: isSorting,
          dragging: isDragging,
          fadeIn: mountedWhileDragging,
        }}
        sx={sx}
      />

      {renderTaskDetailsDialog()}
    </>
  );
}

// ----------------------------------------------------------------------

function useMountStatus() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setIsMounted(true), 500);

    return () => clearTimeout(timeout);
  }, []);

  return isMounted;
}
