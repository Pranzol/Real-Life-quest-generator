import sys

print("Python version:", sys.version)

try:
    import torch
    print("PyTorch version:", torch.__version__)
    cuda_available = torch.cuda.is_available()
    print("CUDA available:", cuda_available)
    if cuda_available:
        print("CUDA device count:", torch.cuda.device_count())
        print("CUDA device name:", torch.cuda.get_device_name(0))
        print("Current CUDA device index:", torch.cuda.current_device())
    else:
        print("PyTorch is running on CPU. To enable GPU, install the CUDA-enabled version of PyTorch.")
except ImportError:
    print("PyTorch is not installed. Run 'pip install torch' to install PyTorch.")
