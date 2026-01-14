'use client';

import { useState } from 'react';

type TaskStatus = 'Pending' | 'Running' | 'Completed';

interface SubTask {
  id: string;
  title: string;
  status: TaskStatus;
}

interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  subtasks: SubTask[];
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [activeTaskForSubtask, setActiveTaskForSubtask] = useState<string | null>(null);

  // タスクの作成
  const addTask = () => {
    if (newTaskTitle.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: newTaskTitle,
        status: 'Pending',
        subtasks: [],
      };
      setTasks([...tasks, newTask]);
      setNewTaskTitle('');
    }
  };

  // タスクの削除
  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  // タスクの編集開始
  const startEditingTask = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTaskTitle(task.title);
  };

  // タスクの編集保存
  const saveTaskEdit = () => {
    if (editingTaskTitle.trim()) {
      setTasks(tasks.map(task =>
        task.id === editingTaskId
          ? { ...task, title: editingTaskTitle }
          : task
      ));
      setEditingTaskId(null);
      setEditingTaskTitle('');
    }
  };

  // タスクの編集キャンセル
  const cancelTaskEdit = () => {
    setEditingTaskId(null);
    setEditingTaskTitle('');
  };

  // タスクのステータス変更
  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, status } : task
    ));
  };

  // サブタスクの追加
  const addSubtask = (taskId: string) => {
    if (newSubtaskTitle.trim()) {
      const newSubtask: SubTask = {
        id: Date.now().toString(),
        title: newSubtaskTitle,
        status: 'Pending',
      };
      setTasks(tasks.map(task =>
        task.id === taskId
          ? { ...task, subtasks: [...task.subtasks, newSubtask] }
          : task
      ));
      setNewSubtaskTitle('');
      setActiveTaskForSubtask(null);
    }
  };

  // サブタスクの削除
  const deleteSubtask = (taskId: string, subtaskId: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, subtasks: task.subtasks.filter(st => st.id !== subtaskId) }
        : task
    ));
  };

  // サブタスクのステータス変更
  const updateSubtaskStatus = (taskId: string, subtaskId: string, status: TaskStatus) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? {
            ...task,
            subtasks: task.subtasks.map(st =>
              st.id === subtaskId ? { ...st, status } : st
            ),
          }
        : task
    ));
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'Pending':
        return 'bg-gray-200 text-gray-800';
      case 'Running':
        return 'bg-blue-200 text-blue-800';
      case 'Completed':
        return 'bg-green-200 text-green-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 dark:text-white">
          TODOアプリ
        </h1>

        {/* タスク作成フォーム */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              placeholder="新しいタスクを入力..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={addTask}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              追加
            </button>
          </div>
        </div>

        {/* タスクリスト */}
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            >
              {/* タスクヘッダー */}
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-1">
                  {editingTaskId === task.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editingTaskTitle}
                        onChange={(e) => setEditingTaskTitle(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && saveTaskEdit()}
                        className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        autoFocus
                      />
                      <button
                        onClick={saveTaskEdit}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                      >
                        保存
                      </button>
                      <button
                        onClick={cancelTaskEdit}
                        className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                      >
                        キャンセル
                      </button>
                    </div>
                  ) : (
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                      {task.title}
                    </h3>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEditingTask(task)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                  >
                    削除
                  </button>
                </div>
              </div>

              {/* タスクステータス */}
              <div className="flex gap-2 mb-4">
                {(['Pending', 'Running', 'Completed'] as TaskStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => updateTaskStatus(task.id, status)}
                    className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
                      task.status === status
                        ? getStatusColor(status)
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {/* サブタスク追加フォーム */}
              <div className="mb-4">
                {activeTaskForSubtask === task.id ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addSubtask(task.id)}
                      placeholder="サブタスクを入力..."
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                      autoFocus
                    />
                    <button
                      onClick={() => addSubtask(task.id)}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      追加
                    </button>
                    <button
                      onClick={() => {
                        setActiveTaskForSubtask(null);
                        setNewSubtaskTitle('');
                      }}
                      className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                    >
                      キャンセル
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveTaskForSubtask(task.id)}
                    className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-sm"
                  >
                    + サブタスクを追加
                  </button>
                )}
              </div>

              {/* サブタスクリスト */}
              {task.subtasks.length > 0 && (
                <div className="space-y-2 pl-4 border-l-2 border-gray-200 dark:border-gray-600">
                  {task.subtasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className="bg-gray-50 dark:bg-gray-700 rounded p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-700 dark:text-gray-200">
                          {subtask.title}
                        </h4>
                        <button
                          onClick={() => deleteSubtask(task.id, subtask.id)}
                          className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                        >
                          削除
                        </button>
                      </div>
                      <div className="flex gap-2">
                        {(['Pending', 'Running', 'Completed'] as TaskStatus[]).map((status) => (
                          <button
                            key={status}
                            onClick={() => updateSubtaskStatus(task.id, subtask.id, status)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                              subtask.status === status
                                ? getStatusColor(status)
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-400'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {tasks.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            タスクがありません。上のフォームから新しいタスクを追加してください。
          </div>
        )}
      </div>
    </div>
  );
}
