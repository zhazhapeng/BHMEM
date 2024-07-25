<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="学生id" prop="studentId">
        <el-input
          v-model="queryParams.studentId"
          placeholder="请输入学生id"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="学生姓名" prop="studentName">
        <el-input
          v-model="queryParams.studentName"
          placeholder="请输入学生姓名"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="课程id" prop="courseId">
        <el-input
          v-model="queryParams.courseId"
          placeholder="请输入课程id"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">

      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:record:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:record:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="recordList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="创建时间" width="155" align="center" prop="createTime" />
      <el-table-column label="学生id" align="center" prop="studentId" />
      <el-table-column label="姓名" align="center" prop="nickName" />
      <el-table-column label="课程id" align="center" prop="courseId" />
      <el-table-column label="课程名称" align="center" prop="courseName" />
      <el-table-column label="实践内容" align="center" prop="courseContent" />
      <el-table-column label="审批状态" align="center" prop="applyStatus" :formatter="getApply" />
      <el-table-column label="操作" width="155" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-success"
            @click="handleAccess(scope.row)"
            v-hasPermi="['system:record:edit']"
          >通过</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-error"
            @click="handleDeny(scope.row)"
            v-hasPermi="['system:record:remove']"
          >驳回</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-more"
            @click="handlDetail(scope.row)"
            v-hasPermi="['system:record:remove']"
          >详情</el-button>
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
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="实践内容" prop="studentId">
          {{ form.applyContent }}
          <!-- <el-input v-model="form.studentId" placeholder="请输入学生id" /> -->
        </el-form-item>
        <el-form-item label="实践收获" prop="courseId">
          {{ form.apply_gain }}
          <!-- <el-input v-model="form.courseId" placeholder="请输入课程id" /> -->
        </el-form-item>
        <el-form-item label="附件展示">
          <img :src="form.fileUrl" width="303" height="303" alt="附件图片" srcset="">
          <!-- <img src= "http://10.138.170.4:8620/profile/upload/2024/07/23/C页迭代_20240723235033A001.png"  alt="附件图片" srcset=""> -->

        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="cancel">确 定</el-button>
        <!-- <el-button @click="cancel">取 消</el-button> -->
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listRecord, getRecord, delRecord, addRecord, updateRecord } from "@/api/system/record";
import mockData from '../mock/record_list';

const applyEnum = {
  1:"未审批",
  2:"通过",
  3:"驳回"
}

export default {
  name: "Record",
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
      recordList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        studentId: null,
        courseId: null,
        applyContent: null,
        applyStatus: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        studentId: [
          { required: true, message: "学生id不能为空", trigger: "blur" }
        ],
        studentName: [
          { required: true, message: "学生姓名不能为空", trigger: "blur" }
        ],
        courseId: [
          { required: true, message: "课程id不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {

    getApply(row) {

      return applyEnum[row.applyStatus];
    },
    /** 查询【请填写功能名称】列表 */
    getList() {
      this.loading = true;
      // mock 
      // let response = mockData;
      // console.log(response , '----------------');
      listRecord(this.queryParams).then(response => {
        this.recordList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        recordId: null,
        studentId: null,
        courseId: null,
        applyContent: null,
        applyStatus: null,
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
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.recordId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
 
    /** 通过按钮操作 */
    handleAccess(row) {
      this.reset();
      // const recordId = row.recordId || this.ids;
      console.log('handleAccess------', row);
      this.$modal.confirm('是否确认通过申请？').then(function() {
        row.applyStatus = 2;
        updateRecord(row).then(response => {
          this.$modal.msgSuccess("修改成功");
          this.open = false;
          this.getList();
        });

        // return delRecord(recordIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("操作成功");
      }).catch(() => {});
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.recordId != null) {
            updateRecord(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addRecord(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 驳回按钮操作 */
    handleDeny(row) {
      this.$modal.confirm('是否确认驳回申请？').then(function() {
        row.applyStatus = 3;
        updateRecord(row).then(response => {
          // this.$modal.msgSuccess("修改成功");
          this.open = false;
          this.getList();
        });
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("操作成功");
      }).catch(() => {});
     
    },
    /** 查看详情操作 */
    handlDetail(row) {
      console.log('查看详情');
      this.open = true;
      this.form  = row;
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/record/export', {
        ...this.queryParams
      }, `record_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
