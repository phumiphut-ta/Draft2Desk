"""
Script to package Draft2Desk backend & static frontend into a single standalone executable using PyInstaller.
"""
import os
import subprocess
import sys

def build():
    print("Building Draft2Desk Standalone Executable with PyInstaller...")
    
    project_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    backend_main = os.path.join(project_dir, "backend", "main.py")
    frontend_dir = os.path.join(project_dir, "frontend")
    
    cmd = [
        sys.executable, "-m", "PyInstaller",
        "--noconfirm",
        "--onedir",
        "--name", "Draft2DeskServer",
        f"--add-data={frontend_dir}{os.pathsep}frontend",
        backend_main
    ]
    
    print("Running command:", " ".join(cmd))
    subprocess.run(cmd, cwd=project_dir)

if __name__ == "__main__":
    build()
