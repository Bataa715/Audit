import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Database from 'better-sqlite3';
import { v4 as uuid } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private db: Database.Database;

  onModuleInit() {
    const dbPath =
      process.env.DATABASE_PATH ||
      path.join(process.cwd(), 'data', 'audit.db');

    // Ensure directory exists
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');

    this.createTables();
  }

  onModuleDestroy() {
    if (this.db) {
      this.db.close();
    }
  }

  /** Raw database handle – use for custom queries */
  get raw(): Database.Database {
    return this.db;
  }

  /** Generate a UUID */
  uuid(): string {
    return uuid();
  }

  private createTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS departments (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        manager TEXT,
        employeeCount INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT (datetime('now')),
        updatedAt TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        userId TEXT UNIQUE,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        position TEXT,
        profileImage TEXT,
        departmentId TEXT REFERENCES departments(id),
        isAdmin INTEGER DEFAULT 0,
        isActive INTEGER DEFAULT 1,
        allowedTools TEXT,
        lastLoginAt TEXT,
        createdAt TEXT DEFAULT (datetime('now')),
        updatedAt TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS exercises (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT,
        description TEXT,
        userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        createdAt TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS workout_logs (
        id TEXT PRIMARY KEY,
        exerciseId TEXT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
        userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        sets INTEGER,
        repetitions INTEGER,
        weight REAL,
        notes TEXT,
        date TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS body_stats (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        weight REAL NOT NULL,
        height REAL NOT NULL,
        date TEXT DEFAULT (datetime('now'))
      );
    `);
  }
}
