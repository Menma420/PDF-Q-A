# ✅ Use a slimmed-down PyTorch image (CPU only, no CUDA)
FROM pytorch/pytorch:2.2.2-cpu

# Set working directory
WORKDIR /app

# Install required system packages and clean up
RUN apt-get update && \
    apt-get install -y --no-install-recommends git && \
    rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy rest of the app
COPY . .

# Expose the FastAPI port
EXPOSE 8000

# Run the FastAPI app
CMD ["uvicorn", "AI_Assistant:app", "--host", "0.0.0.0", "--port", "8000"]
