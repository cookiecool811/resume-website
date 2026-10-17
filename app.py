"""
Adrian - 个人简历网站
Flask + Jinja2，部署于 PythonAnywhere
"""
from flask import Flask, render_template, send_from_directory
import os

app = Flask(__name__)

# 简历 PDF 文件名（放在 static/pdf/ 下）
RESUME_PDF = "Adrian-ZHAO简历.pdf"


@app.route("/")
def index():
    """单页简历首页"""
    return render_template("index.html", resume_pdf=RESUME_PDF)


@app.route("/pdf/<path:filename>")
def download_pdf(filename):
    """提供 PDF 简历下载"""
    return send_from_directory(
        os.path.join(app.static_folder, "pdf"), filename, as_attachment=False
    )


@app.route("/favicon.ico")
def favicon():
    """favicon（内联 SVG 路由到静态文件）"""
    return send_from_directory(os.path.join(app.static_folder, "img"), "favicon.svg")


if __name__ == "__main__":
    # 本地开发用，PythonAnywhere 上由 WSGI 调用 app
    app.run(host="127.0.0.1", port=5000, debug=False)
