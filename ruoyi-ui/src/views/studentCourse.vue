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

    <el-row :gutter="10" class="mb8" style="display: flex; justify-content: flex-end; padding-bottom: 2%;">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-success"
          size="middle"
          @click="handleSubmit"
         
        >确认提交</el-button>
      </el-col>
      <!-- <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar> -->
    </el-row>

    <el-table v-loading="loading" :data="infoList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="课程编号" align="center" prop="courseId" />
      <el-table-column label="一级课程名称" align="center" prop="courseName" />
      <el-table-column label="二级课程名称" align="center" prop="secondCourseName" />
      <el-table-column label="课程内容" align="center" prop="courseContent" />
      <el-table-column label="必修/选修" align="center" prop="necessary" :formatter="getCourseRequire"/>
      <el-table-column label="需完成次数" align="center" prop="requireTimes" />
      <el-table-column label="学分" align="center" prop="courseScore1" />
      
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改【请填写功能名称】对话框 -->
    <el-dialog :title="title" style="text-align: center;" :visible.sync="open" width="800px" append-to-body>
     <div> <strong>
       请仔细阅读以下选课规则后，确认所选课程是否符合要求，并满足本年度学分计划后提交申报。
     </strong>
     </div>

     <img src="../assets/shuoming.jpg" width="703" height="852" alt="" srcset="">

      <!-- 这个位置贴一张说明图片？ -->
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// import { listInfo, getInfo, delInfo, addInfo, updateInfo } from "@/api/system/info";
import { listCourse, selectCourse, delCourse, addCourse, updateCourse } from "@/api/system/studentCourse";
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
        planId: 1,
        studentId: null,
        userId: null,
        workNo: null,
        workClass: null,
        degreeType: null,
        teacher: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        userId: [
          { required: true, message: "用户id不能为空", trigger: "blur" }
        ],
      }
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
      // console.log(response, '-----------');
      listCourse(this.queryParams).then(response => {
        this.infoList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    getCourseRequire(item) {
      return requireEnum[item.necessary];
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

    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.courseId);
      this.selectCourse = selection;
      console.log(selection, '-----------', this.ids);
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleSubmit() {
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
      console.log(this.selectCourse, '-----------');
      // 把选择的课程数组id传入
      // 选择完课程后，更新学生选课信息
      selectCourse(this.selectCourse).then(response => {
        this.$modal.msgSuccess("修改成功");
        this.open = false;
        this.getList();
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
