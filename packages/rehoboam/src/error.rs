pub async fn handle_result<T>(task: tokio::task::JoinHandle<anyhow::Result<T>>) -> napi::Result<T> {
    match task.await {
        Ok(result) => match result {
            Ok(value) => Ok(value),
            Err(e) => Err(napi::Error::new(
                napi::Status::GenericFailure,
                format!("Operation failed: {:?}", e),
            )),
        },
        Err(e) => Err(napi::Error::new(
            napi::Status::GenericFailure,
            format!("Task join failed: {:?}", e),
        )),
    }
}
