"""
Legacy one-shot migration for SQLite only (checklist_progress column).
For PostgreSQL, tables are created automatically via SQLAlchemy on app startup.

Usage (SQLite only):
    python migrate_add_checklist.py
"""
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "crisis_compass.db")


def main():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # Check existing columns
    cur.execute("PRAGMA table_info(users)")
    columns = {row[1] for row in cur.fetchall()}

    if "checklist_progress" in columns:
        print("[OK] Column 'checklist_progress' already exists -- nothing to do.")
    else:
        cur.execute(
            "ALTER TABLE users ADD COLUMN checklist_progress TEXT DEFAULT '[]'"
        )
        conn.commit()
        print("[OK] Added 'checklist_progress' column to 'users' table.")

    conn.close()


if __name__ == "__main__":
    main()
