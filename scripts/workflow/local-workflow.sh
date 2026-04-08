#!/bin/bash
#
# Local Workflow Manager
# 用于管理本地开发工作流，支持任务追踪和状态管理
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
WORKFLOW_STATE_FILE=".local-workflow.state.json"
TRACING_DIR="tasks/tracing"
TASKS_DIR="tasks"

# Helper functions
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Initialize workflow state
init_workflow() {
    if [ ! -f "$WORKFLOW_STATE_FILE" ]; then
        cat > "$WORKFLOW_STATE_FILE" << EOF
{
  "version": "1.0",
  "current_task": null,
  "completed_tasks": [],
  "tasks": []
}
EOF
        print_success "Initialized workflow state file"
    fi
    
    mkdir -p "$TRACING_DIR"
}

# Start a task
start_task() {
    local task_file="$1"
    
    if [ ! -f "$task_file" ]; then
        print_error "Task file not found: $task_file"
        exit 1
    fi
    
    local task_name=$(basename "$task_file" .md)
    local task_id="local-$(date +%Y%m%d)-$(openssl rand -hex 4 | cut -c1-8)"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    # Update workflow state
    cat > "$WORKFLOW_STATE_FILE" << EOF
{
  "task_file": "$task_file",
  "task_id": "$task_id",
  "title": "$task_name",
  "started_at": "$(date +"%Y-%m-%d %H:%M:%S")",
  "status": "in_progress",
  "tracing_file": "$TRACING_DIR/${task_name}.md"
}
EOF
    
    # Create tracing file
    local tracing_file="$TRACING_DIR/${task_name}.md"
    cat > "$tracing_file" << EOF
# Task Tracing: $task_name

## Metadata
- **Task ID**: $task_id
- **Source**: $task_file
- **Started**: $timestamp
- **Status**: In Progress

## Description
$(head -20 "$task_file" | grep -v "^#" | head -10)

## Progress Log

### $(date -u +"%Y-%m-%d %H:%M:%S") - Task Started
- Initial analysis and planning

## Implementation Notes

### Current Progress
- [ ] Analysis complete
- [ ] Design complete
- [ ] Implementation complete
- [ ] Testing complete

### Blockers
<!-- List any blockers here -->

### Decisions
<!-- Record important decisions here -->

## Code Changes

### Files Modified
<!-- List modified files -->

### Commits
<!-- List commits -->

## Verification

### Test Results
<!-- Record test results -->

### Checklist
- [ ] Feature works as expected
- [ ] No regression issues
- [ ] Documentation updated
- [ ] Code reviewed

## Completion

### Summary
<!-- Summarize what was done -->

### Next Steps
<!-- List follow-up tasks -->

EOF
    
    print_success "Started task: $task_name"
    print_info "Task ID: $task_id"
    print_info "Tracing file: $tracing_file"
    
    # Open tracing file in default editor if available
    if command -v code &> /dev/null; then
        code "$tracing_file"
    elif command -v vim &> /dev/null; then
        print_info "Run 'vim $tracing_file' to edit tracing file"
    fi
}

# Complete a task
complete_task() {
    local notes="$1"
    
    if [ ! -f "$WORKFLOW_STATE_FILE" ]; then
        print_error "No active task found"
        exit 1
    fi
    
    local task_file=$(jq -r '.task_file' "$WORKFLOW_STATE_FILE")
    local task_name=$(jq -r '.title' "$WORKFLOW_STATE_FILE")
    local tracing_file=$(jq -r '.tracing_file' "$WORKFLOW_STATE_FILE")
    
    # Update workflow state
    jq '.status = "completed" | .completed_at = "'$(date +"%Y-%m-%d %H:%M:%S")'"' "$WORKFLOW_STATE_FILE" > "${WORKFLOW_STATE_FILE}.tmp"
    mv "${WORKFLOW_STATE_FILE}.tmp" "$WORKFLOW_STATE_FILE"
    
    # Append to tracing file
    cat >> "$tracing_file" << EOF

### $(date -u +"%Y-%m-%d %H:%M:%S") - Task Completed
$notes

## Final Status: ✅ Completed
EOF
    
    print_success "Completed task: $task_name"
    
    # Archive the task
    mv "$WORKFLOW_STATE_FILE" "${WORKFLOW_STATE_FILE}.completed.$(date +%Y%m%d%H%M%S)"
    
    print_info "Workflow state archived"
}

# Show current task status
status() {
    if [ ! -f "$WORKFLOW_STATE_FILE" ]; then
        print_warning "No active task"
        return
    fi
    
    local status=$(jq -r '.status' "$WORKFLOW_STATE_FILE")
    local task_file=$(jq -r '.task_file' "$WORKFLOW_STATE_FILE")
    local task_name=$(jq -r '.title' "$WORKFLOW_STATE_FILE")
    local started_at=$(jq -r '.started_at' "$WORKFLOW_STATE_FILE")
    
    echo "Current Task Status"
    echo "=================="
    echo "Task: $task_name"
    echo "File: $task_file"
    echo "Status: $status"
    echo "Started: $started_at"
    
    if [ "$status" = "in_progress" ]; then
        local tracing_file=$(jq -r '.tracing_file' "$WORKFLOW_STATE_FILE")
        echo "Tracing: $tracing_file"
    fi
}

# List available tasks
list_tasks() {
    print_info "Available task files:"
    
    find "$TASKS_DIR" -name "*.md" -type f | while read -r file; do
        # Skip tracing files
        if [[ "$file" == *"/tracing/"* ]]; then
            continue
        fi
        
        # Get first line (title)
        local title=$(head -1 "$file" | sed 's/^#* //')
        echo "  - $(basename "$file"): $title"
    done
}

# Create git worktree for feature development
create_worktree() {
    local feature_name="$1"
    local base_branch="${2:-main}"
    
    if [ -z "$feature_name" ]; then
        print_error "Feature name required"
        exit 1
    fi
    
    # Sanitize feature name
    local branch_name="feature/$(echo "$feature_name" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd '[:alnum:]-')"
    local worktree_dir="../worktrees/${branch_name}"
    
    print_info "Creating worktree for: $feature_name"
    print_info "Branch: $branch_name"
    print_info "Directory: $worktree_dir"
    
    # Create parent directory for worktrees
    mkdir -p "../worktrees"
    
    # Fetch latest from origin
    git fetch origin
    
    # Create branch if not exists
    if ! git rev-parse --verify "$branch_name" &>/dev/null; then
        git checkout -b "$branch_name" origin/$base_branch
        print_success "Created branch: $branch_name"
    fi
    
    # Create worktree
    if [ ! -d "$worktree_dir" ]; then
        git worktree add "$worktree_dir" "$branch_name"
        print_success "Created worktree at: $worktree_dir"
    else
        print_warning "Worktree already exists at: $worktree_dir"
    fi
    
    echo ""
    print_success "Worktree ready!"
    echo ""
    echo "To start working:"
    echo "  cd $worktree_dir"
    echo ""
    echo "To push changes:"
    echo "  git push -u origin $branch_name"
}

# Remove git worktree
remove_worktree() {
    local branch_name="$1"
    local worktree_dir="../worktrees/$branch_name"
    
    if [ ! -d "$worktree_dir" ]; then
        print_error "Worktree not found: $worktree_dir"
        exit 1
    fi
    
    git worktree remove "$worktree_dir"
    print_success "Removed worktree: $worktree_dir"
    
    # Optionally remove branch
    read -p "Remove branch $branch_name? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git branch -D "$branch_name"
        print_success "Removed branch: $branch_name"
    fi
}

# List all worktrees
list_worktrees() {
    print_info "Active worktrees:"
    git worktree list
}

# Main command dispatcher
case "${1:-help}" in
    init)
        init_workflow
        ;;
    start)
        if [ -z "${2:-}" ]; then
            print_error "Task file required"
            echo "Usage: $0 start <task-file>"
            list_tasks
            exit 1
        fi
        init_workflow
        start_task "$2"
        ;;
    complete)
        complete_task "${2:-Task completed successfully}"
        ;;
    status)
        status
        ;;
    list)
        list_tasks
        ;;
    worktree-create)
        create_worktree "${2:-}" "${3:-main}"
        ;;
    worktree-remove)
        if [ -z "${2:-}" ]; then
            print_error "Branch name required"
            exit 1
        fi
        remove_worktree "$2"
        ;;
    worktree-list)
        list_worktrees
        ;;
    help|*)
        echo "Local Workflow Manager"
        echo ""
        echo "Usage: $0 <command> [args]"
        echo ""
        echo "Commands:"
        echo "  init                        Initialize workflow system"
        echo "  start <task-file>           Start working on a task"
        echo "  complete [notes]            Complete current task"
        echo "  status                      Show current task status"
        echo "  list                        List available tasks"
        echo ""
        echo "Git Worktree Commands:"
        echo "  worktree-create <name> [base-branch]   Create a new worktree"
        echo "  worktree-remove <branch-name>          Remove a worktree"
        echo "  worktree-list                          List all worktrees"
        echo ""
        echo "Examples:"
        echo "  $0 start tasks/mindstorm/executable-tutorial.md"
        echo "  $0 worktree-create executable-tutorial"
        ;;
esac
