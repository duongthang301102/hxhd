require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const SftpClient = require('ssh2-sftp-client');
const cors = require('cors');

const app = express();
app.use(cors()); // Cho phép React gọi sang

// Cấu hình (Dán cứng để đảm bảo kết nối thành công)
const PBX_CONFIG = {
    host: '192.168.145.128',
    dbUser: 'freepbxuser',
    dbPass: 'jwd777jQ5V4G',         // Pass DB chuẩn
    sshUser: 'root',
    sshPass: 'Thang30112002@'       // Pass SSH máy ảo chuẩn
};

// API lấy file ghi âm
app.get('/api/recording', async (req, res) => {
    const { phone } = req.query;
    if (!phone) return res.status(400).send("Thiếu số điện thoại");

    let connection;
    let sftp = new SftpClient();

    try {
        console.log(`[REQ] Tìm ghi âm cho số: ${phone}`);

        // 1. Kết nối Database
        connection = await mysql.createConnection({
            host: PBX_CONFIG.host,
            user: PBX_CONFIG.dbUser,
            password: PBX_CONFIG.dbPass,
            database: 'asteriskcdrdb'
        });

        // 2. Query tìm file ghi âm mới nhất
        const [rows] = await connection.execute(
            `SELECT recordingfile, calldate FROM cdr 
             WHERE (dst = ? OR src = ?) 
             AND recordingfile != '' 
             ORDER BY calldate DESC LIMIT 1`,
            [phone, phone]
        );

        if (rows.length === 0) {
            console.log("-> Không tìm thấy log cuộc gọi trong DB");
            return res.status(404).send("Chưa có dữ liệu ghi âm");
        }

        const filename = rows[0].recordingfile;
        const callDate = new Date(rows[0].calldate);
        console.log(`-> Tìm thấy file trong DB: ${filename}`);

        // 3. Xây dựng đường dẫn file trên Linux
        const year = callDate.getFullYear();
        const month = String(callDate.getMonth() + 1).padStart(2, '0');
        const day = String(callDate.getDate()).padStart(2, '0');
        
        const fullPath = `/var/spool/asterisk/monitor/${year}/${month}/${day}/${filename}`;
        
        // 4. Kết nối SFTP
        await sftp.connect({
            host: PBX_CONFIG.host,
            username: PBX_CONFIG.sshUser,
            password: PBX_CONFIG.sshPass
        });

        const exists = await sftp.exists(fullPath);
        if (!exists) {
            console.error(`-> File không tồn tại trên ổ cứng: ${fullPath}`);
            return res.status(404).send("File audio chưa được lưu xong");
        }

        // 5. Stream file về cho React (ĐÃ SỬA LỖI PIPE)
        console.log(`-> Đang stream file về client...`);
        res.setHeader('Content-Type', 'audio/wav');
        
        // Cách sửa: Truyền 'res' vào làm tham số thứ 2. 
        // Thư viện sẽ tự động pipe dữ liệu vào response.
        await sftp.get(fullPath, res);

    } catch (error) {
        console.error("LỖI SYSTEM:", error);
        // Kiểm tra nếu header chưa gửi thì mới gửi lỗi
        if (!res.headersSent) {
            res.status(500).send("Lỗi Server: " + error.message);
        }
    } finally {
        if (connection) await connection.end();
        // Không cần sftp.end() ở đây vì thư viện ssh2-sftp-client quản lý luồng get khá kỹ, 
        // nhưng nếu muốn chắc chắn đóng kết nối SSH sau khi xong:
        sftp.end(); 
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`✅ API Server đang chạy tại: http://localhost:${PORT}`);
    console.log(`👉 Kết nối tới FreePBX: ${PBX_CONFIG.host}`);
});