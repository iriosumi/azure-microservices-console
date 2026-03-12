package com.azure.poc.dto;

public record LogEntry(String time, String level, String thread, String className, String message) {}
