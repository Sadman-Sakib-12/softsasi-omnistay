'use client';

import React, { useState } from 'react';
import { Sparkles, CheckCircle2, Clock, AlertTriangle, User, BedDouble, Plus, RefreshCw, Loader2, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { housekeepingService, HousekeepingTaskItem, CreateHousekeepingTaskDto } from '@/features/housekeeping/services/housekeeping.service';
import { useRooms } from '@/features/rooms/hooks/use-rooms';

export default function HousekeepingPage() {
  const queryClient = useQueryClient();
  const { rooms } = useRooms();
  const [isDispatchOpen, setIsDispatchOpen] = useState(false);
  const [newTask, setNewTask] = useState<CreateHousekeepingTaskDto>({
    roomNumber: '',
    taskType: 'checkout_clean',
    priority: 'normal',
    notes: '',
  });

  const { data: tasks = [], isLoading: isTasksLoading } = useQuery<HousekeepingTaskItem[]>({
    queryKey: ['housekeepingTasks'],
    queryFn: () => housekeepingService.getTasks(),
  });

  const dispatchMutation = useMutation({
    mutationFn: (dto: CreateHousekeepingTaskDto) => housekeepingService.createTask(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['housekeepingTasks'] });
      setIsDispatchOpen(false);
      setNewTask({ roomNumber: '', taskType: 'checkout_clean', priority: 'normal', notes: '' });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: any }) =>
      housekeepingService.updateTaskStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['housekeepingTasks'] });
    },
  });

  const assignedTasks = tasks.filter((t) => t.status === 'assigned');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const completedTasks = tasks.filter((t) => t.status === 'completed' || t.status === 'verified');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#00a8ff]" /> Housekeeping & Maid Dispatch
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time room cleanliness statuses, turn-down assignments, and inspection logs (Chapter 4.1.6).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['housekeepingTasks'] })}
            variant="outline"
            size="sm"
            className="text-xs bg-white"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
          </Button>
          <Button
            onClick={() => setIsDispatchOpen(true)}
            size="sm"
            className="bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Dispatch Cleaning Task
          </Button>
        </div>
      </div>

      {/* 3-Column Housekeeping Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Assigned Queue */}
        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" /> Pending Dispatch
            </CardTitle>
            <Badge variant="outline" className="text-xs">{assignedTasks.length}</Badge>
          </CardHeader>
          <CardContent className="space-y-3 pt-3">
            {assignedTasks.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No pending cleaning jobs</p>
            ) : (
              assignedTasks.map((task) => (
                <div key={task.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">{task.roomNumber}</span>
                    <Badge variant={task.priority === 'high' ? 'destructive' : 'outline'} className="text-[10px]">
                      {task.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium capitalize">
                    {task.taskType.replace('_', ' ')}
                  </div>
                  {task.notes && <p className="text-[11px] text-slate-500">{task.notes}</p>}
                  <Button
                    size="xs"
                    onClick={() => updateStatusMutation.mutate({ id: task.id, status: 'in_progress' })}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white text-[11px] h-7"
                  >
                    Start Cleaning
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Column 2: In Progress */}
        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-3 border-b border-amber-100 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold text-amber-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> In Progress (Maid In Room)
            </CardTitle>
            <Badge variant="warning" className="text-xs">{inProgressTasks.length}</Badge>
          </CardHeader>
          <CardContent className="space-y-3 pt-3">
            {inProgressTasks.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No rooms currently being cleaned</p>
            ) : (
              inProgressTasks.map((task) => (
                <div key={task.id} className="p-3 rounded-lg bg-amber-50/50 border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">{task.roomNumber}</span>
                    <span className="text-[10px] text-amber-700 font-semibold">{task.housekeeperName}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium capitalize">
                    {task.taskType.replace('_', ' ')}
                  </div>
                  {task.notes && <p className="text-[11px] text-slate-500">{task.notes}</p>}
                  <Button
                    size="xs"
                    onClick={() => updateStatusMutation.mutate({ id: task.id, status: 'completed' })}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] h-7"
                  >
                    Mark Complete
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Column 3: Completed & Inspected */}
        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-3 border-b border-emerald-100 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Inspected & Ready
            </CardTitle>
            <Badge variant="success" className="text-xs">{completedTasks.length}</Badge>
          </CardHeader>
          <CardContent className="space-y-3 pt-3">
            {completedTasks.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No inspected rooms logged</p>
            ) : (
              completedTasks.map((task) => (
                <div key={task.id} className="p-3 rounded-lg bg-emerald-50/40 border border-emerald-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">{task.roomNumber}</span>
                    <Badge variant="success" className="text-[10px]">
                      READY FOR CHECK-IN
                    </Badge>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Inspected by {task.housekeeperName}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dispatch Modal */}
      {isDispatchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00a8ff]" /> Dispatch Housekeeping Cleaning Task
              </h3>
              <button onClick={() => setIsDispatchOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await dispatchMutation.mutateAsync(newTask);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Room Assignment</label>
                <input
                  type="text"
                  required
                  value={newTask.roomNumber}
                  onChange={(e) => setNewTask({ ...newTask, roomNumber: e.target.value })}
                  placeholder="e.g. Room 302"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00a8ff]"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Task Cleaning Type</label>
                <select
                  value={newTask.taskType}
                  onChange={(e) => setNewTask({ ...newTask, taskType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00a8ff]"
                >
                  <option value="checkout_clean">Checkout Clean (3 Credits)</option>
                  <option value="stayover_clean">Stayover Clean (1 Credit)</option>
                  <option value="deep_clean">Quarterly Deep Clean</option>
                  <option value="inspection">Supervisor Inspection</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00a8ff]"
                >
                  <option value="normal">Normal Priority</option>
                  <option value="high">High (VIP / Early Check-In)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Maid Instructions / Notes</label>
                <textarea
                  rows={2}
                  value={newTask.notes}
                  onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00a8ff]"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsDispatchOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={dispatchMutation.isPending}
                  className="bg-[#00a8ff] hover:bg-[#0097e6] text-white"
                >
                  {dispatchMutation.isPending ? 'Dispatching...' : 'Dispatch Task'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
