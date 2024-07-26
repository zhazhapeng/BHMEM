<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="课程id" prop="courseId">
        <el-input
          v-model="queryParams.courseId"
          placeholder="请输入课程id"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="课程名称" prop="courseName">
        <el-input
          v-model="queryParams.courseName"
          placeholder="请输入课程名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      
      <el-form-item label="导师" prop="teacher">
        <el-input
          v-model="queryParams.teacher"
          placeholder="请输入导师"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-success"
          size="mini"
          @click="handleSubmit"
          v-hasPermi="['system:info:add']"
        >确认提交</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row> -->

    <el-table v-loading="loading" :data="infoList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="课程编号" align="center" prop="courseId" />
      <el-table-column label="课程名称" align="center" prop="courseName" />
      <el-table-column label="课程内容" align="center" prop="courseContent" />
      <el-table-column label="必修/选修" align="center" prop="necessary" :formatter="getCourseRequire" />
      <el-table-column label="需完成次数" align="center" prop="requireTimes" />
      <el-table-column label="学分" align="center" prop="score" />
      <el-table-column label="课程进度" align="center" prop="progress" :formatter="getCourseProgress" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope" v-if="true">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleSubmit(scope.row)"
          >申请通过</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleItem(scope.row)"
          >取消</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改【请填写功能名称】对话框 -->
    <el-dialog style="text-align: center;" :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row :gutter="10" class="mb8">
          <div style="text-align: left; margin-left: 5%;"> <label>课程名称: </label> {{ form.courseName }}  <label style="margin-left: 10%;">需完成次数:</label>{{ form.requireTimes + '次' }}</div>

        </el-row>
        
        
        <el-form-item label="实践内容" prop="apply_content">
          <el-input v-model="form.apply_content" placeholder="请输内容描述" />
        </el-form-item>
        <el-form-item label="实践收获" prop="apply_gain">
          <el-input v-model="form.apply_gain" placeholder="请输入实践收获" />
        </el-form-item>
        <el-form-item label="实践日期" prop="date">
          <el-date-picker v-model="form.date" format="yyyy-MM-dd" value-format="yyyy-MM-dd"
            :style="{width: '100%'}" placeholder="请选择日期选择" clearable></el-date-picker>
        </el-form-item>
        <!-- <el-form-item label="展示">
          <editor v-model="form.file_url" :min-height="192"/>
        </el-form-item> -->

            <el-form-item label="上传附件" prop="file_url">
            <el-upload v-model="form.file_url" :file-list="uploadList" :action="field_urlAction" multiple
            :on-success="handleUploadSuccess"  
            :before-upload="field_urlBeforeUpload" list-type="picture">
              <el-button size="small" type="primary" icon="el-icon-upload">点击上传</el-button>
            </el-upload>
          </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// import { listInfo, getInfo, delInfo, addInfo, updateInfo } from "@/api/system/info";
import { addRecord, studentSelfCourse, updateInfo, delCourse, addCourse, updateCourse } from "@/api/system/studentCourse";
// import { listRecord, addRecord, updateRecord, delRecord } from "@/api/system/record";

import mockData from '../mock/course_list';

const requireEnum = {
  1:"必修",
  2:"选修"
}
const progressEnum = {
  0:"未开始",
  1:"进行中",
  2:"已完成"
}

export default {
  name: "Info",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 【请填写功能名称】表格数据
      infoList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        // studentId: 1,
        workNo: null,
        workClass: null,
        degreeType: null,
        teacher: null,
      },
      field_urlAction: 'http://10.138.170.4:8620/common/upload',
      // http://10.138.170.4:8620/profile/upload/2024/07/21/C页迭代_20240721190519A002.png
      uploadList: [],
      // 表单参数
      form: {
        file_url: "",
        // student_id: 3,
      },
      // 表单校验
      rules: {
        apply_content: [
          { required: true, message: "实践内容不能为空", trigger: "blur" }
        ],
        apply_gain: [
          { required: false, message: "实收获不能为空", trigger: "blur" }
        ],
      },
      // 上传图片数量
      number: 0,
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询【请填写功能名称】列表 */
    getList() {
      this.loading = true;
      
      // const response = mockData;
      studentSelfCourse(this.queryParams).then(response => {
        this.infoList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 获取课程必修选修枚举
    getCourseRequire(item) {
      return requireEnum[item.necessary];
    },
    // 图片验证
    field_urlBeforeUpload(file) {
      let isRightSize = file.size / 1024 / 1024 < 2
      if (!isRightSize) {
        this.$message.error('文件大小超过 2MB')
      }
      return isRightSize
    },
      // 上传成功回调
      handleUploadSuccess(res, file) {
        console.log(res, file, '图片上传成功----------');
      if (res.code === 200) {
        this.uploadList.push({ name: res.originalFilename, url: res.url });
        this.form.file_url = res.url;
        this.uploadedSuccessfully();
      } else {
        this.number--;
        this.$modal.closeLoading();
        this.$modal.msgError(res.msg);
        this.$refs.imageUpload.handleRemove(file);
        this.uploadedSuccessfully();
      }
    },
    // 删除图片
    handleDelete(file) {
      const findex = this.fileList.map(f => f.name).indexOf(file.name);
      if (findex > -1) {
        this.fileList.splice(findex, 1);
        this.$emit("input", this.listToString(this.fileList));
      }
    },
    // 上传失败
    handleUploadError() {
      this.$modal.msgError("上传图片失败，请重试");
      this.$modal.closeLoading();
    },
    // 上传结束处理
    uploadedSuccessfully() {
      if (this.number > 0 && this.uploadList.length === this.number) {
        this.fileList = this.fileList.concat(this.uploadList);
        this.uploadList = [];
        this.number = 0;
        this.$emit("input", this.listToString(this.fileList));
        this.$modal.closeLoading();
      }
    },


    // 获取课程进度
    getCourseProgress(item) {
      // console.log(item, '-----------');
      
      return item&item.status ? progressEnum[item.status]: '未开始';
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        userId: null,
        workNo: null,
        workClass: null,
        degreeType: null,
        teacher: null,
        createTime: null,
        updateTime: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    handleItem(item) {
      this.handleSelectionChange([item]);
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      // console.log(selection, '-----------');
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleSubmit(item) {
      Object.assign(this.form, item);
      this.open = true;
      this.title = "确定提交";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getInfo(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改【请填写功能名称】";
      });
    },
    /** 提交按钮 */
    submitForm() {
      // this.$modal.msgSuccess("提交成功");
      // this.open = false;
      console.log(this.uploadList, '-----------');
      this.$refs["form"].validate(valid => {
        addRecord(this.form).then(response => {
            this.$modal.msgSuccess("提交成功");
            this.open = false;
            this.getList();
          });


        // if (valid) {
        //   if (this.form.id != null) {
        //     updateInfo(this.form).then(response => {
        //       this.$modal.msgSuccess("修改成功");
        //       this.open = false;
        //       this.getList();
        //     });
        //   } else {
            
        //   }
        // }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除【请填写功能名称】编号为"' + ids + '"的数据项？').then(function() {
        return delInfo(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/info/export', {
        ...this.queryParams
      }, `info_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
