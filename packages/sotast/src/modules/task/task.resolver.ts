import { NotFoundException } from "@nestjs/common";
import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { TaskModel } from "./task.model.js";
import { TaskService } from "./task.service.js";

@Resolver(() => TaskModel)
export class TaskResolver {
  constructor(private taskService: TaskService) {}

  @Query(() => [TaskModel])
  tasks() {
    return this.taskService.getTasks();
  }

  @Mutation(() => TaskModel)
  runTask(@Args({ name: "id", type: () => ID }) id: string): TaskModel {
    const task = this.taskService.runTask(id);
    if (!task) throw new NotFoundException(`Task "${id}" not found`);
    return {
      ...task,
      running: true,
    };
  }
}
