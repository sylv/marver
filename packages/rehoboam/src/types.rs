use napi_derive::napi;

#[derive(Debug, Clone)]
#[napi(object)]
pub struct BoundBox {
    pub x1: f64,
    pub y1: f64,
    pub x2: f64,
    pub y2: f64,
}

impl BoundBox {
    pub fn to_pixels(&self, image_size: (u32, u32)) -> BoundBox {
        BoundBox {
            x1: self.x1 * image_size.0 as f64,
            y1: self.y1 * image_size.1 as f64,
            x2: self.x2 * image_size.0 as f64,
            y2: self.y2 * image_size.1 as f64,
        }
    }
}

#[derive(Debug, Clone)]
#[napi(object)]
pub struct Landmark {
    pub x: f64,
    pub y: f64,
}
