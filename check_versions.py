import subprocess
import sys

def check_package_version(package_name):
    try:
        # Try to import the package
        module = __import__(package_name)
        # Get version if available
        version = getattr(module, '__version__', 'Unknown')
        return f"{package_name}: {version}"
    except ImportError:
        return f"{package_name}: Not installed"

if __name__ == "__main__":
    print(f"Python version: {sys.version}")
    
    # Check Flask version
    print(check_package_version('flask'))
    
    # Check Flask-CORS version
    print(check_package_version('flask_cors'))
    
    # Try to get more information using pip
    print("\nPip list for relevant packages:")
    subprocess.run([sys.executable, "-m", "pip", "list", "|", "grep", "-E", "(flask|cors)"], shell=True)
